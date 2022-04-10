import mongodb from 'mongodb';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';

import { Apartment } from 'src/schemas/apartment.schema';
import { ApartmentService } from 'src/services/apartment.service';
import { GetApartmentDto } from 'src/dto/apartment/GetApartmentDto';

@Controller('apartments')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get()
  async findAll(@Query() query: GetApartmentDto): Promise<Apartment[]> {
    return this.apartmentService.findAll(query);
  }

  @Get('update-steet-search')
  async updateStreetSearch(): Promise<Apartment[]> {
    return this.apartmentService.updateStreetsSearch();
  }

  @Put('change-state/:id')
  async updateState(
    @Param('id') id: string,
    @Body() body: { state: string },
  ): Promise<Apartment> {
    return this.apartmentService.updateState({ id, state: body.state });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.apartmentService.delete(id);
  }
}
