import { Module } from '@nestjs/common';
import { TaskService } from 'src/services/task.service';
import { ParserModule } from './parser.module';

@Module({
  imports: [ParserModule],
  providers: [TaskService],
})
export class TaskModule {}
