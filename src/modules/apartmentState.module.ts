import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApartmentStateController } from 'src/controllers/apartmentState.controller';
import {
  ApartmentState,
  ApartmentStateSchema,
} from 'src/schemas/apartmentState.schema';
import { ApartmentStateService } from 'src/services/apartmentState.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApartmentState.name, schema: ApartmentStateSchema },
    ]),
  ],
  controllers: [ApartmentStateController],
  providers: [ApartmentStateService],
})
export class ApartmentStateModule {}
