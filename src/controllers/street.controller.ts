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
    try {
      const res = await this.streetService.create(createStreetDto);
      return res;
    } catch (error) {
      return error;
    }
  }

  @Post('/many')
  async createMany(@Body() streets: CreateStreetDto[]): Promise<Street[]> {
    try {
      const res = await this.streetService.bulkCreate(streets);
      return res;
    } catch (error) {
      return error;
    }
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
