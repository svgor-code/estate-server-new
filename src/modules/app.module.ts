import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { AreaModule } from './area.module';
import { StreetModule } from './street.module';
import { TaskModule } from './task.module';

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_DB } = process.env;

const mongoConnectionString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@estate-server_mongo_1:${MONGO_PORT}/${MONGO_DB}-new?authSource=admin&readPreference=primary&directConnection=true&ssl=false`;

@Module({
  imports: [
    MongooseModule.forRoot(mongoConnectionString),
    ScheduleModule.forRoot(),
    StreetModule,
    AreaModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
