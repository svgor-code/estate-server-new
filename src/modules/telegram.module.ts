import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TelegramService } from 'src/services/telegram.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'apartments-notification',
    }),
  ],
  controllers: [],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
