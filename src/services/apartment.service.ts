import { Model, Document } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Apartment, ApartmentDocument } from 'src/schemas/apartment.schema';
import { Area, AreaDocument } from 'src/schemas/area.schema';
import { CreateApartmentDto } from 'src/dto/apartment/CreateApartmentDto';
import {
  ApartmentStatusEnum,
  IApartment,
} from 'src/interfaces/apartment.interface';
import { UpdateApartmentStateDto } from 'src/dto/apartment/UpdateApartmentStateDto';
import { UpdateApartmentStatusDto } from 'src/dto/apartment/UpdateApartmentStatusDto copy';

type AreaResultType = Area &
  Document<any, any, any> & {
    _id: any;
  };

type ApartmentUpdateStatusType = {
  status: ApartmentStatusEnum;
  checkCounter: number;
};

@Injectable()
export class ApartmentService {
  private readonly logger = new Logger(ApartmentService.name);

  constructor(
    @InjectModel(Area.name)
    private areaModel: Model<AreaDocument>,
    @InjectModel(Apartment.name)
    private apartmentModel: Model<ApartmentDocument>,
  ) {}

  async create(createApartmentDto: CreateApartmentDto): Promise<Apartment[]> {
    const areas = await this.areaModel
      .find()
      .populate({ path: 'streetHouses', populate: { path: 'street' } })
      .exec();

    const existingApartaments = await this.apartmentModel.find();

    const apartaments = this.findSuitableApartaments(
      areas,
      createApartmentDto.apartments,
      existingApartaments,
    );

    const createdApartaments = await this.apartmentModel.insertMany(
      apartaments,
    );

    return createdApartaments;
  }

  async findAll(status: ApartmentStatusEnum): Promise<Apartment[]> {
    return this.apartmentModel
      .find({ status })
      .populate({ path: 'area' })
      .populate({ path: 'state' })
      .exec();
  }

  async getById(id: string): Promise<Apartment> {
    return this.apartmentModel.findById(id).exec();
  }

  async updateStatus({
    id,
    status,
  }: UpdateApartmentStatusDto): Promise<Apartment> {
    const apartment = await this.getById(id);
    const { checkCounter } = apartment;

    const updateData = this.getApartmentStateData(status, checkCounter);

    return await this.apartmentModel.findByIdAndUpdate(id, {
      $set: {
        ...updateData,
        checkedAt: new Date(),
      },
    });
  }

  async updateState({
    id,
    state,
  }: UpdateApartmentStateDto): Promise<Apartment> {
    return await this.apartmentModel.findByIdAndUpdate(id, {
      $set: {
        state,
      },
    });
  }

  private findSuitableApartaments(
    areas: AreaResultType[],
    apartaments: IApartment[],
    existingApartaments: Apartment[],
  ): IApartment[] {
    return apartaments.reduce<IApartment[]>((acc, curr) => {
      const isAlreadyExist = existingApartaments.some(
        (item) => item.platformId === curr.platformId,
      );

      if (isAlreadyExist) {
        return acc;
      }

      const area = this.findSuitableArea(areas, curr);

      if (!area) {
        return acc;
      }

      return [
        ...acc,
        {
          ...curr,
          area: area._id,
          status: ApartmentStatusEnum.PUBLISHED,
          checkCounter: 0,
          checkedAt: new Date(),
        },
      ];
    }, []);
  }

  private findSuitableArea(
    areas: AreaResultType[],
    apartment: IApartment,
  ): AreaResultType | undefined {
    const { house, street } = apartment;

    return areas.find((area) => {
      const { streetHouses } = area;

      return streetHouses.some((streetHouse) => {
        const areaStreet = streetHouse.street.name.toLowerCase();
        const areaHouses = streetHouse.houses.map((house) =>
          house.toLowerCase(),
        );

        if (
          areaStreet.includes(street.toLowerCase()) &&
          areaHouses.includes(house.toLowerCase())
        ) {
          return true;
        }

        return false;
      });
    });
  }

  private getApartmentStateData(
    status: ApartmentStatusEnum,
    checkCounter: number,
  ): ApartmentUpdateStatusType {
    if (status === ApartmentStatusEnum.PUBLISHED) {
      return {
        status: ApartmentStatusEnum.PUBLISHED,
        checkCounter: 0,
      };
    }

    if (status === ApartmentStatusEnum.CLOSED) {
      if (checkCounter >= 3) {
        return {
          status: ApartmentStatusEnum.DELETED,
          checkCounter,
        };
      }

      return {
        status,
        checkCounter: checkCounter + 1,
      };
    }

    return {
      status,
      checkCounter,
    };
  }
}
