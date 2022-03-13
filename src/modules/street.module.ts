import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StreetController } from 'src/controllers/street.controller';
import { Street, StreetSchema } from 'src/schemas/street.schema';
import { StreetService } from 'src/services/street.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Street.name, schema: StreetSchema }]),
  ],
  controllers: [StreetController],
  providers: [StreetService],
})
export class StreetModule {}
