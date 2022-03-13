import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreaController } from 'src/controllers/area.controller';
import { Area, AreaSchema } from 'src/schemas/area.schema';
import { StreetHouse, StreetHouseSchema } from 'src/schemas/streetHouse.schema';
import { AreaService } from 'src/services/area.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
    MongooseModule.forFeature([
      { name: StreetHouse.name, schema: StreetHouseSchema },
    ]),
  ],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
