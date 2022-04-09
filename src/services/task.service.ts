import moment from 'moment';
import Bull, { Queue } from 'bull';
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

  // every 2 minutes at 14 seconds
  @Cron('14 */3 * * * *')
  startParseAvitoCatalog() {
    this.parserService.parseAvitoCatalog();
  }

  // every 10 minutes at 30 seconds
  @Cron('30 */10 * * * *')
  async generateCheckApartmentsList() {
    this.logger.log('start generate apartments list to check');
    const apartments = await this.apartmentModel.find({
      status: {
        $ne: ApartmentStatusEnum.DELETED,
      },
      checkedAt: {
        $lte: moment().subtract(3, 'hours').toDate(),
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
          removeOnFail: false,
          jobId: apartment._id.toString(),
        },
      };
    });

    const currentJobs = await this.apartmentsCheckerQueue.getJobs([
      'active',
      'completed',
      'delayed',
      'failed',
      'paused',
      'waiting',
    ]);

    const currentApartmentsIdsInQueue = currentJobs.map((job) => job.data);
    const newJobs = queueJobs.filter((job: any) => {
      return !currentApartmentsIdsInQueue.includes(job.data);
    });

    await this.apartmentsCheckerQueue.addBulk(newJobs);

    this.logger.log(
      `[${newJobs.length}] apartments was added to apartments-checker queue`,
    );
  }

  // every 10 minutes at 23 seconds
  @Cron('40 */5 * * *')
  async checkApartmentsStatus() {
    this.logger.log('start check apartment status');

    const job = await this.apartmentsCheckerQueue.getNextJob();

    if (!job) {
      this.logger.log('jobs not found');
      return;
    }

    const apartment = await this.apartmentModel.findById(job.data);

    if (!apartment || !apartment.href) {
      return await job.moveToCompleted();
    }

    const result = await this.parserService.parseAvitoItem(
      apartment._id,
      apartment.href,
    );

    if (result.success) {
      return await job.moveToCompleted();
    }

    return await job.moveToFailed({
      message: result.error.message,
    });
  }
}
