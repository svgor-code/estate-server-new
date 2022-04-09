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
import { UpdateApartmentStateDto } from 'src/dto/apartmentState/UpdateApartmentStateDto';

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

  @Put('/update-bulk')
  async bulkUpdate(
    @Body() updateApartmentStateDto: UpdateApartmentStateDto[],
  ): Promise<ApartmentState[]> {
    return this.apartmentStateService.bulkUpdate(updateApartmentStateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.apartmentStateService.delete(id);
  }
}
