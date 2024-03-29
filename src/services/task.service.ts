import moment from 'moment';
import Bull, { Job, Queue } from 'bull';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { ParserService } from './parser.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Apartment, ApartmentDocument } from 'src/schemas/apartment.schema';
import { Cron } from '@nestjs/schedule';
import { ApartmentStatusEnum } from 'src/interfaces/apartment.interface';

/*

  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | months
  | | | day of month
  | | hours
  | minutes
  seconds (optional)

*/

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private parserService: ParserService,
    @InjectModel(Apartment.name)
    private apartmentModel: Model<ApartmentDocument>,
    @InjectQueue('apartments-checker')
    private readonly apartmentsCheckerQueue: Queue<string>,
  ) {}

  // every 3 minutes at 10 seconds
  @Cron('10 */3 * * * *')
  startParseAvitoCatalog() {
    this.parserService.parseAvitoCatalog();
  }

  // every 10 minutes at 20 seconds
  @Cron('20 */10 * * * *')
  async generateCheckApartmentsList() {
    this.logger.log('start generate apartments list to check');
    const apartments = await this.apartmentModel.find({
      status: {
        $ne: ApartmentStatusEnum.DELETED,
      },
      checkedAt: {
        $lte: moment().subtract(3, 'days').toDate(),
      },
    });

    const queueJobs: {
      name?: string;
      data: string;
      opts?: Omit<Bull.JobOptions, 'repeat'>;
    }[] = apartments.map((apartment) => {
      return {
        name: 'apartments-checker',
        data: apartment._id.toString(),
        opts: {
          removeOnComplete: true,
          removeOnFail: true,
          jobId: apartment._id.toString(),
        },
      };
    });

    await this.apartmentsCheckerQueue.addBulk(queueJobs);

    this.logger.log(
      `[${queueJobs.length}] apartments was added to apartments-checker queue`,
    );
  }

  // every 3 minutes at 40 seconds
  @Cron('40 */3 * * * *')
  async checkApartmentsStatus() {
    this.logger.log('start check apartment status');

    const job: Job =
      (await this.apartmentsCheckerQueue.getActive()[0]) ||
      (await this.apartmentsCheckerQueue.getNextJob());

    if (!job) {
      this.logger.log('jobs not found');
      return;
    }

    const apartment = await this.apartmentModel.findById(job.data);

    if (!apartment || !apartment.href) {
      await job.moveToFailed({
        message: 'Apartment not found',
      });
      return await job.remove();
    }

    const result = await this.parserService.parseAvitoItem(
      apartment._id,
      apartment.href,
    );

    if (result.success) {
      await job.moveToFailed({
        message: 'done',
      });
      return await job.remove();
    }

    await job.moveToFailed({
      message: result.error.message,
    });
    return await job.remove();
  }
}
