import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } =
  process.env;

const mongoConnectionString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@estate-server_mongo_1:${MONGO_PORT}/${MONGO_DB}-new?authSource=admin&readPreference=primary&directConnection=true&ssl=false`;

@Module({
  imports: [MongooseModule.forRoot(mongoConnectionString)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
