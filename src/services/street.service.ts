import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IStreet } from 'src/interfaces/street.interface';
import { Street, StreetDocument } from 'src/schemas/street.schema';
import { CreateStreetDto } from 'src/dto/street/CreateStreetDto';
import mongodb from 'mongodb';
import { UpdateStreetDto } from 'src/dto/street/UpdateStreetDto';

@Injectable()
export class StreetService {
  constructor(
    @InjectModel(Street.name) private streetModel: Model<StreetDocument>,
  ) {}

  async get(id: string): Promise<Street> {
    return this.streetModel.findById(id).exec();
  }

  async create(createStreetDto: CreateStreetDto): Promise<Street> {
    const createdStreet = await this.streetModel.create(createStreetDto);

    return createdStreet.save();
  }

  async bulkCreate(streets: CreateStreetDto[]): Promise<Street[]> {
    const createdStreets = await this.streetModel.insertMany(streets);
    return createdStreets;
  }

  async findAll(): Promise<IStreet[]> {
    const streets = await this.streetModel.find().exec();
    return streets.sort((a, b) => a.name.localeCompare(b.name));
  }

  async update(id: string, updateStreetDto: UpdateStreetDto): Promise<Street> {
    const updatedStreet = await this.streetModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name: updateStreetDto.name,
          avitoName: updateStreetDto.avitoName,
        },
      },
      {
        new: true,
      },
    );

    return updatedStreet;
  }

  async delete(id: string): Promise<mongodb.DeleteResult> {
    return await this.streetModel.deleteOne({
      _id: id,
    });
  }
}
