import moment from 'moment';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { ParserService } from './parser.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Apartment, ApartmentDocument } from 'src/schemas/apartment.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    this.parserService.parseAvitoCatalog();
  }

  @Cron('20 * * * * *')
  async generateCheckApartmentsList() {
    this.logger.log('start generate apartments list to check');
    const apartments = await this.apartmentModel.find({
      checkedAt: {
        // $lte: moment().subtract(4, 'days'),
        $lte: moment(),
      },
    });

    const queueJobs = apartments.map((apartment) => {
      return {
        name: 'apartments-checker',
        data: apartment._id,
      };
    });

    await this.apartmentsCheckerQueue.addBulk(queueJobs);
  }

  @Cron('20 */2 * * * *')
  async checkApartmentsStatus() {
    this.logger.log('start check apartment status');

    const job = await this.apartmentsCheckerQueue.getNextJob();

    const result = await this.parserService.parseAvitoItem(job.data);

    if (result.success) {
      return await job.progress(100);
    }

    return await job.progress(0);
  }
}
