import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateAreaDto } from 'src/dto/area/CreateAreaDto';
import { UpdateAreaDto } from 'src/dto/area/UpdateAreaDto';
import { Area } from 'src/schemas/area.schema';
import { AreaService } from 'src/services/area.service';
import mongodb from 'mongodb';

@Controller('areas')
export class AreaController {
  constructor(private areaService: AreaService) {}

  @Post()
  async create(@Body() createAreaDto: CreateAreaDto): Promise<Area> {
    return this.areaService.create(createAreaDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAreaDto: UpdateAreaDto,
  ): Promise<Area> {
    return this.areaService.update(id, updateAreaDto);
  }

  @Get()
  async findAll(): Promise<Area[]> {
    return this.areaService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.areaService.delete(id);
  }
}
