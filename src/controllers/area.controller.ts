import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import mongodb from 'mongodb';
import { Area } from 'src/schemas/area.schema';
import { CreateAreaDto } from 'src/dto/area/CreateAreaDto';
import { UpdateAreaDto } from 'src/dto/area/UpdateAreaDto';
import { AreaService } from 'src/services/area.service';
import { ApartmentService } from 'src/services/apartment.service';

@Controller('areas')
export class AreaController {
  constructor(
    private areaService: AreaService,
    private apartmentService: ApartmentService,
  ) {}

  @Post()
  async create(@Body() createAreaDto: CreateAreaDto): Promise<Area> {
    const newArea = await this.areaService.create(createAreaDto);

    await this.apartmentService.addNewAreaToApartments(newArea._id.toString());

    return newArea;
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

  @Get(':id')
  async get(@Param('id') id: string): Promise<Area> {
    return this.areaService.get(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<mongodb.DeleteResult> {
    return this.areaService.delete(id);
  }
}
