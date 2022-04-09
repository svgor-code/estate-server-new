import mongodb from 'mongodb';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateApartmentStateDto } from 'src/dto/apartmentState/CreateApartmentStateDto';
import { ApartmentState } from 'src/schemas/apartmentState.schema';
import { ApartmentStateService } from 'src/services/apartmentState.service';
import { UpdateApartmentStateOrderDto } from 'src/dto/apartmentState/UpdateApartmentStateOrderDto';

@Controller('apartment-state')
export class ApartmentStateController {
  constructor(private apartmentStateService: ApartmentStateService) {}

  @Post()
  async create(
    @Body() createApartmentStateDto: CreateApartmentStateDto,
  ): Promise<ApartmentState> {
    return this.apartmentStateService.create(createApartmentStateDto);
  }

  @Get()
  async findAll(): Promise<ApartmentState[]> {
    return this.apartmentStateService.findAll();
  }

  @Put('/order/:id')
  async updateOrder(
    @Param(':id') id: string,
    @Body() { order }: UpdateApartmentStateOrderDto,
  ): Promise<ApartmentState> {
    return this.apartmentStateService.updateOrder(id, order);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.apartmentStateService.delete(id);
  }
}
