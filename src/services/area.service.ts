import { Model, Document } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Area, AreaDocument } from 'src/schemas/area.schema';
import { CreateAreaDto } from 'src/dto/area/CreateAreaDto';
import {
  StreetHouse,
  StreetHouseDocument,
} from 'src/schemas/streetHouse.schema';
import { UpdateAreaDto } from 'src/dto/area/UpdateAreaDto';
import { CreateStreetHouseDto } from 'src/dto/streetHouse/CreateStreetHouseDto';
import mongodb from 'mongodb';
import { ApartmentService } from './apartment.service';

@Injectable()
export class AreaService {
  constructor(
    @InjectModel(Area.name) private areaModel: Model<AreaDocument>,
    @InjectModel(StreetHouse.name)
    private streetHouseModel: Model<StreetHouseDocument>,
    private apartmentService: ApartmentService,
  ) {}

  async create(createAreaDto: CreateAreaDto): Promise<
    Area &
      Document<any, any, any> & {
        _id: any;
      }
  > {
    const { streetHouses } = createAreaDto;

    const savedStreetHouses = await this.createStreetHouses(streetHouses);

    const createdArea = new this.areaModel({
      ...createAreaDto,
      streetHouses: savedStreetHouses,
    });

    return createdArea.save();
  }

  async findAll(): Promise<Area[]> {
    return this.areaModel
      .find()
      .populate({ path: 'streetHouses', populate: { path: 'street' } })
      .exec();
  }

  async get(id: string): Promise<Area> {
    return this.areaModel
      .findById(id)
      .populate({ path: 'streetHouses', populate: { path: 'street' } })
      .exec();
  }

  async update(id: string, updateAreaDto: UpdateAreaDto): Promise<Area> {
    await this.removeStreetHouses(id);

    const streetHouses = await this.createStreetHouses(
      updateAreaDto.streetHouses,
    );

    const updatedArea = await this.areaModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name: updateAreaDto.name,
          description: updateAreaDto.description,
          streetHouses,
        },
      },
      {
        new: true,
      },
    );

    return updatedArea;
  }

  async delete(id: string): Promise<mongodb.DeleteResult> {
    await this.removeStreetHouses(id);

    const { items: linkedApartments } = await this.apartmentService.findAll({
      area: id,
    });

    await Promise.all(
      linkedApartments.map(async (apartment) => {
        await this.apartmentService.updateArea(apartment._id, null);
      }),
    );

    return await this.areaModel.deleteOne({
      _id: id,
    });
  }

  private async createStreetHouses(
    streetHouses: CreateStreetHouseDto[],
  ): Promise<string[]> {
    const createdStreetHouses = await Promise.all(
      streetHouses.map(async (streetHouse) => {
        return await new this.streetHouseModel(streetHouse);
      }),
    );

    const savedStreetHouses = await Promise.all(
      createdStreetHouses.map(async (createdStreetHouse) => {
        return createdStreetHouse.save();
      }),
    );

    return savedStreetHouses.map((item) => item._id) || [];
  }

  private async removeStreetHouses(areaId: string): Promise<void> {
    const currentArea = await this.areaModel
      .findById(areaId)
      .populate('streetHouses');

    const currentStreetHousesIds =
      currentArea.streetHouses?.map((item: StreetHouseDocument) => item._id) ||
      [];

    await this.streetHouseModel.deleteMany({
      _id: {
        $in: currentStreetHousesIds,
      },
    });
  }
}
