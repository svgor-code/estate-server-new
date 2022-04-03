import { Module } from '@nestjs/common';
import { ParserController } from 'src/controllers/parser.controller';
import { ParserService } from 'src/services/parser.service';
import { ApartmentModule } from './apartment.module';
import { StreetModule } from './street.module';

@Module({
  imports: [ApartmentModule, StreetModule],
  providers: [ParserService],
  controllers: [ParserController],
  exports: [ParserService],
})
export class ParserModule {}
