import { Job, Queue } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { IApartment } from 'src/interfaces/apartment.interface';

@Processor('apartments-notification')
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot = new TelegramBot(process.env.TG_TOKEN, {
    polling: true,
  });

  constructor(
    @InjectQueue('apartments-notification')
    private readonly apartmentsNotificationQueue: Queue<string>,
  ) {}

  async addedApartmentsToQueue(apartments: IApartment[]): Promise<void> {
    this.logger.log(
      `Added [${apartments.length}] apartments to queue apartments-notification`,
    );

    const queueJobs = apartments.map((apartment) => {
      return {
        name: 'apartments-notification',
        data: this.getApartmentMessageTemplete(apartment),
        opts: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      };
    });

    await this.apartmentsNotificationQueue.addBulk(queueJobs);
  }

  @Process('apartments-notification')
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
      await job.moveToFailed({
        message: `Message was not sent to ${process.env.TG_CHAT_ID}`,
      });
      return;
    }

    this.logger.log(`New apartament was sent to bot`);
    await job.moveToCompleted();
  }

  private getApartmentMessageTemplete(apartment: IApartment): string {
    const { title, address, price, pricePerMeter, href } = apartment;

    return `${title} \nАдрес: ${address} \nЦена: ${price} рублей (${pricePerMeter} руб. за кв.м.) \nСсылка: ${href}`;
  }
}
