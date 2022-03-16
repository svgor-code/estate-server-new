import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ParserService } from './parser.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private parserService: ParserService) {}

  // @Cron('5 * * * * *')
  // handleCron() {
  //   this.logger.debug('Called cron job');
  //   this.parserService.startParsing();
  // }
}
