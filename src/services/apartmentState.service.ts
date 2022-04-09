import mongodb from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ApartmentState,
  ApartmentStateDocument,
} from 'src/schemas/apartmentState.schema';
import { CreateApartmentStateDto } from 'src/dto/apartmentState/CreateApartmentStateDto';
import { UpdateApartmentStateDto } from 'src/dto/apartmentState/UpdateApartmentStateDto';

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

  async bulkUpdate(
    updateApartmentStateDto: UpdateApartmentStateDto[],
  ): Promise<ApartmentState[]> {
    return await Promise.all(
      updateApartmentStateDto.map(async (apartmentState) => {
        return await this.apartmentStateModel.findByIdAndUpdate(
          apartmentState._id,
          {
            $set: {
              order: apartmentState.order,
            },
          },
          {
            new: true,
          },
        );
      }),
    );
  }

  async findAll(): Promise<ApartmentState[]> {
    return (await this.apartmentStateModel.find().exec()).sort(
      (a, b) => a.order - b.order,
    );
  }

  async delete(id: string): Promise<mongodb.DeleteResult> {
    return await this.apartmentStateModel.deleteOne({
      _id: id,
    });
  }
}
