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
import {
  ApartmentFindWrapper,
  ApartmentRingStatusEnum,
} from 'src/interfaces/apartment.interface';

@Controller('apartments')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get()
  async findAll(
    @Query() query: GetApartmentDto,
  ): Promise<ApartmentFindWrapper> {
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

  @Put('change-ring-status/:id')
  async updateRingStatus(
    @Param('id') id: string,
    @Body() body: { ringStatus: ApartmentRingStatusEnum },
  ): Promise<Apartment> {
    return this.apartmentService.updateRingStatus({
      id,
      ringStatus: body.ringStatus,
    });
  }

  @Put('update-price/:id')
  async updatePrice(
    @Param('id') id: string,
    @Body() body: { price: number },
  ): Promise<Apartment> {
    return this.apartmentService.updatePrice({
      id,
      price: body.price,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.apartmentService.delete(id);
  }
}
