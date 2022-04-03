import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApartmentController } from 'src/controllers/apartment.controller';
import { Apartment, ApartmentSchema } from 'src/schemas/apartment.schema';
import { Area, AreaSchema } from 'src/schemas/area.schema';
import { ApartmentService } from 'src/services/apartment.service';
import { StreetModule } from './street.module';
import { TelegramModule } from './telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
    MongooseModule.forFeature([
      { name: Apartment.name, schema: ApartmentSchema },
    ]),
    StreetModule,
    TelegramModule,
  ],
  controllers: [ApartmentController],
  providers: [ApartmentService],
  exports: [ApartmentService],
})
export class ApartmentModule {}
