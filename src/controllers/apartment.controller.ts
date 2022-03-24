import { Controller, Get } from '@nestjs/common';
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

  @Get('sold')
  async findSoldAll(): Promise<Apartment[]> {
    return this.apartmentService.findAll(ApartmentStatusEnum.DELETED);
  }
}
