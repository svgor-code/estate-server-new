import { Controller, Get } from '@nestjs/common';
import { ApartmentService } from 'src/services/apartment.service';
import { ParserService } from 'src/services/parser.service';

@Controller()
export class ParserController {
  constructor(
    private readonly parserService: ParserService,
    private readonly apartmentService: ApartmentService,
  ) {}

  @Get('/parser-data')
  async getParserData(): Promise<string> {
    const catalog = await this.parserService.startAvitoCatalog();

    await this.apartmentService.create({ apartments: catalog });

    return JSON.stringify(catalog);
  }
}
