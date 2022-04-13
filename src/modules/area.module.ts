import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreaController } from 'src/controllers/area.controller';
import { Area, AreaSchema } from 'src/schemas/area.schema';
import { StreetHouse, StreetHouseSchema } from 'src/schemas/streetHouse.schema';
import { AreaService } from 'src/services/area.service';
import { ApartmentModule } from './apartment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
    MongooseModule.forFeature([
      { name: StreetHouse.name, schema: StreetHouseSchema },
    ]),
    ApartmentModule,
  ],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
