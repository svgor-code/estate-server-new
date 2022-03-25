import { Controller, Get, Param } from '@nestjs/common';
import { ApartmentService } from 'src/services/apartment.service';
import { ParserService } from 'src/services/parser.service';

@Controller('parsers')
export class ParserController {
  constructor(
    private readonly parserService: ParserService,
    private readonly apartmentService: ApartmentService,
  ) {}

  @Get('/avito-catalog')
  async getAvitoCatalog(): Promise<string> {
    const result = await this.parserService.parseAvitoCatalog();

    return JSON.stringify(result);
  }

  @Get('/avito-item/:id')
  async getAvitoItem(@Param('id') id: string): Promise<string> {
    const apartment = await this.apartmentService.getById(id);
    const result = await this.parserService.parseAvitoItem(id, apartment.href);

    return JSON.stringify(result);
  }
}
