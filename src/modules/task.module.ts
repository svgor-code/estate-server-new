import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TaskService } from 'src/services/task.service';
import { ParserModule } from './parser.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Apartment, ApartmentSchema } from 'src/schemas/apartment.schema';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'apartments-checker',
    }),
    MongooseModule.forFeature([
      { name: Apartment.name, schema: ApartmentSchema },
    ]),
    ParserModule,
  ],
  providers: [TaskService],
})
export class TaskModule {}
