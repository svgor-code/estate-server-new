import { Module } from '@nestjs/common';
import { ParserController } from 'src/controllers/parser.controller';
import { ParserService } from 'src/services/parser.service';
import { ApartmentModule } from './apartment.module';

@Module({
  imports: [ApartmentModule],
  providers: [ParserService],
  controllers: [ParserController],
  exports: [ParserService],
})
export class ParserModule {}
