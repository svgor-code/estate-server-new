import { Controller, Get } from '@nestjs/common';
import { Apartment } from 'src/schemas/apartment.schema';
import { ApartmentService } from 'src/services/apartment.service';

@Controller('apartments')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get()
  async findAll(): Promise<Apartment[]> {
    return this.apartmentService.findAll();
  }
}
