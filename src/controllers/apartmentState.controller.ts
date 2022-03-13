import { Body, Controller, Post } from '@nestjs/common';
import { CreateApartmentStateDto } from 'src/dto/apartmentState/CreateApartmentStateDto';
import { ApartmentState } from 'src/schemas/apartmentState.schema';
import { ApartmentStateService } from 'src/services/apartmentState.service';

@Controller('apartment-state')
export class ApartmentStateController {
  constructor(private apartmentStateService: ApartmentStateService) {}

  @Post()
  async create(
    @Body() createApartmentStateDto: CreateApartmentStateDto,
  ): Promise<ApartmentState> {
    return this.apartmentStateService.create(createApartmentStateDto);
  }

  async findAll(): Promise<ApartmentState[]> {
    return this.apartmentStateService.findAll();
  }
}
