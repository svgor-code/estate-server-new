import mongodb from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ApartmentState,
  ApartmentStateDocument,
} from 'src/schemas/apartmentState.schema';
import { CreateApartmentStateDto } from 'src/dto/apartmentState/CreateApartmentStateDto';

@Injectable()
export class ApartmentStateService {
  constructor(
    @InjectModel(ApartmentState.name)
    private apartmentStateModel: Model<ApartmentStateDocument>,
  ) {}

  async create(
    createApartmentStateDto: CreateApartmentStateDto,
  ): Promise<ApartmentState> {
    const createdApartmentState = await this.apartmentStateModel.create(
      createApartmentStateDto,
    );

    return createdApartmentState.save();
  }

  async updateOrder(id: string, order: number): Promise<ApartmentState> {
    return await this.apartmentStateModel.findByIdAndUpdate(id, {
      $set: {
        order,
      },
    });
  }

  async findAll(): Promise<ApartmentState[]> {
    return this.apartmentStateModel.find().exec();
  }

  async delete(id: string): Promise<mongodb.DeleteResult> {
    return await this.apartmentStateModel.deleteOne({
      _id: id,
    });
  }
}
