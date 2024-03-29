import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateStreetDto } from 'src/dto/street/CreateStreetDto';
import { Street } from 'src/schemas/street.schema';
import { StreetService } from 'src/services/street.service';
import mongodb from 'mongodb';
import { UpdateStreetDto } from 'src/dto/street/UpdateStreetDto';

@Controller('streets')
export class StreetController {
  constructor(private streetService: StreetService) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<Street> {
    return this.streetService.get(id);
  }

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
      return await this.streetService.bulkCreate(streets);
    } catch (error) {
      return error;
    }
  }

  @Get()
  async findAll(): Promise<Street[]> {
    return this.streetService.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStreetDto: UpdateStreetDto,
  ) {
    try {
      return await this.streetService.update(id, updateStreetDto);
    } catch (error) {
      return error;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.streetService.delete(id);
  }
}
