import mongodb from 'mongodb';
import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ApartmentStatusEnum } from 'src/interfaces/apartment.interface';
import { Apartment } from 'src/schemas/apartment.schema';
import { ApartmentService } from 'src/services/apartment.service';

@Controller('apartments')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get('active')
  async findActiveAll(): Promise<Apartment[]> {
    return this.apartmentService.findAll(ApartmentStatusEnum.PUBLISHED);
  }

  @Get('inactive')
  async findInactiveAll(): Promise<Apartment[]> {
    return this.apartmentService.findAll(ApartmentStatusEnum.CLOSED);
  }

  @Get('removed')
  async findRemovedAll(): Promise<Apartment[]> {
    return this.apartmentService.findAll(ApartmentStatusEnum.DELETED);
  }

  @Put('change-state/:id')
  async update(
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
