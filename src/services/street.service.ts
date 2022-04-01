import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Street, StreetDocument } from 'src/schemas/street.schema';
import { CreateStreetDto } from 'src/dto/street/CreateStreetDto';
import mongodb from 'mongodb';

@Injectable()
export class StreetService {
  constructor(
    @InjectModel(Street.name) private streetModel: Model<StreetDocument>,
  ) {}

  async create(createStreetDto: CreateStreetDto): Promise<Street> {
    const createdStreet = await this.streetModel.create(createStreetDto);

    return createdStreet.save();
  }

  async bulkCreate(streets: CreateStreetDto[]): Promise<Street[]> {
    const createdStreets = await this.streetModel.insertMany(streets);
    return createdStreets;
  }

  async findAll(): Promise<Street[]> {
    const streets = await this.streetModel.find().exec();
    return streets.sort((a, b) => a.name.localeCompare(b.name));
  }

  async delete(id: string): Promise<mongodb.DeleteResult> {
    return await this.streetModel.deleteOne({
      _id: id,
    });
  }
}
