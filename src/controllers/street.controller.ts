import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateStreetDto } from 'src/dto/street/CreateStreetDto';
import { Street } from 'src/schemas/street.schema';
import { StreetService } from 'src/services/street.service';
import mongodb from 'mongodb';

@Controller('streets')
export class StreetController {
  constructor(private streetService: StreetService) {}

  @Post()
  async create(@Body() createStreetDto: CreateStreetDto): Promise<Street> {
    return this.streetService.create(createStreetDto);
  }

  @Get()
  async findAll(): Promise<Street[]> {
    return this.streetService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.streetService.delete(id);
  }
}
