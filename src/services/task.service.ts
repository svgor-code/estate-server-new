import moment from 'moment';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { ParserService } from './parser.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Apartment, ApartmentDocument } from 'src/schemas/apartment.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  @Cron(CronExpression.EVERY_12_HOURS)
  async generateCheckApartmentsList() {
    const apartments = await this.apartmentModel.find({
      checkedAt: {
        $lte: moment().subtract(4, 'days'),
      },
    });

    const queueJobs = apartments.map((apartment) => {
      return {
        name: 'check-apartment-status',
        data: apartment._id,
      };
    });

    await this.apartmentsCheckerQueue.addBulk(queueJobs);
  }

  @Cron('2 */10 * * * *')
  async checkApartmentsStatus() {
    const job = await this.apartmentsCheckerQueue.getNextJob();

    const result = await this.parserService.parseAvitoItem(job.data);

    if (result.success) {
      return await job.progress(100);
    }

    return await job.progress(0);
  }
}
