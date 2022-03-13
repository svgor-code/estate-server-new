import { Module } from '@nestjs/common';
import { TaskService } from 'src/services/task.service';

@Module({
  providers: [TaskService],
})
export class TaskModule {}
