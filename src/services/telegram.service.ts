import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import TelegramBot from 'node-telegram-bot-api';
import { IApartment } from 'src/interfaces/apartment.interface';

@Processor('apartments-notification')
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectQueue('apartments-notification')
    private readonly apartmentsNotificationQueue: Queue<string>,
    private readonly bot: TelegramBot,
  ) {
    bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });
  }

  async addedApartmentsToQueue(apartments: IApartment[]): Promise<void> {
    const queueJobs = apartments.map((apartment) => {
      return {
        name: 'notification-apartment-telegram',
        data: this.getApartmentMessageTemplete(apartment),
      };
    });

    await this.apartmentsNotificationQueue.addBulk(queueJobs);
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

    return await job.progress(100);
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
