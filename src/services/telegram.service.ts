import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, JobStatus, Queue } from 'bull';
import * as TelegramBot from 'node-telegram-bot-api';
import { IApartment } from 'src/interfaces/apartment.interface';

@Injectable()
@Processor('apartments-notification')
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot = new TelegramBot(process.env.TG_TOKEN, {
    polling: true,
  });

  constructor(
    @InjectQueue('apartments-notification')
    private apartmentsNotificationQueue: Queue<string>,
  ) {}

  async addedApartmentsToQueue(apartments: IApartment[]): Promise<void> {
    this.logger.log(
      `Added [${apartments.length}] apartments to queue apartments-notification`,
    );

    const activeJobs =
      await this.apartmentsNotificationQueue.getJobCountByTypes('active');

    this.logger.log(`Notifications queue have ${activeJobs} active status`);

    const queueJobsPromise = apartments.map(async (apartment) => {
      return await this.apartmentsNotificationQueue.add(
        this.getApartmentMessageTemplete(apartment),
      );
    });

    const [queueJobs] = await Promise.all(queueJobsPromise);

    this.logger.log('Queue jobs: ', queueJobs);

    ['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'].forEach(
      (status) => {
        this.logger.log(
          `Notifications queue have ${this.apartmentsNotificationQueue.getJobCountByTypes(
            status as JobStatus,
          )} ${status} status`,
        );
      },
    );
  }

  @Process()
  async sendNewApartmentMessage(job: Job<string>): Promise<void> {
    const message = await this.bot.sendMessage(
      process.env.TG_CHAT_ID,
      job.data,
      {
        parse_mode: 'HTML',
      },
    );

    if (!message || !message.message_id) {
      this.logger.error(`Message was not sent to ${process.env.TG_CHAT_ID}`);
      return await job.progress(0);
    }

    await job.progress(100);

    this.logger.log(
      `Notifications queue have ${this.apartmentsNotificationQueue.getJobCountByTypes(
        [
          'active',
          'completed',
          'delayed',
          'failed',
          'paused',
          'waiting',
        ] as JobStatus[],
      )}`,
    );
  }

  private getApartmentMessageTemplete(apartment: IApartment): string {
    const { title, address, price, pricePerMeter, href } = apartment;

    return `
      ${title} \n 
      Адрес: ${address} \n
      Цена: ${price} рублей (${pricePerMeter} руб. за кв.м.) \n 
      Ссылка: ${href}`;
  }
}
