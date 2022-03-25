import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { AreaModule } from './area.module';
import { ParserModule } from './parser.module';
import { StreetModule } from './street.module';
import { TaskModule } from './task.module';
import { ApartmentStateModule } from './apartmentState.module';

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_DB } = process.env;

const mongoConnectionString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@estate-server-mongo-1:${MONGO_PORT}/${MONGO_DB}-new?authSource=admin&readPreference=primary&directConnection=true&ssl=false`;

@Module({
  imports: [
    MongooseModule.forRoot(mongoConnectionString),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
      },
    }),
    StreetModule,
    AreaModule,
    TaskModule,
    ParserModule,
    ApartmentStateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
