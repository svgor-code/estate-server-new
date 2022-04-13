import mongodb from 'mongodb';
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
import { UpdateApartmentStatusDto } from 'src/dto/apartment/UpdateApartmentStatusDto';
import { TelegramService } from './telegram.service';
import moment from 'moment';
import { StreetService } from './street.service';
import { IStreet } from 'src/interfaces/street.interface';
import Fuse from 'fuse.js';
import { GetApartmentDto } from 'src/dto/apartment/GetApartmentDto';

type AreaResultType = Area &
  Document<any, any, any> & {
    _id: any;
  };

type ApartmentUpdateStatusType = {
  status: ApartmentStatusEnum;
  checkCounter: number;
  closedAt?: Date;
};

@Injectable()
export class ApartmentService {
  private readonly logger = new Logger(ApartmentService.name);

  constructor(
    @InjectModel(Area.name)
    private areaModel: Model<AreaDocument>,
    @InjectModel(Apartment.name)
    private apartmentModel: Model<ApartmentDocument>,
    private readonly telegramService: TelegramService,
    private readonly streetService: StreetService,
  ) {}

  async create({
    apartments: newApartments,
  }: CreateApartmentDto): Promise<Apartment[]> {
    const areas = await this.areaModel
      .find()
      .populate({ path: 'streetHouses', populate: { path: 'street' } })
      .exec();

    const existingApartaments = await this.apartmentModel.find().exec();

    const apartaments = this.filterNewApartaments(
      areas,
      newApartments,
      existingApartaments,
    );

    await this.telegramService.addedApartmentsToQueue(apartaments);

    const createdApartaments = await this.apartmentModel.insertMany(
      apartaments,
    );

    return createdApartaments;
  }

  async findAll(query: GetApartmentDto): Promise<
    (Apartment &
      Document<any, any, any> & {
        _id: any;
      })[]
  > {
    return await this.apartmentModel
      .find(query)
      .populate({ path: 'area' })
      .populate({ path: 'state' })
      .sort({ createdAt: 'desc' })
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
    const prevStatus = apartment.status;

    this.logger.log(`update status start: id = ${id}, status = ${status}`);

    const updateData = this.getApartmentStateData(
      prevStatus,
      status,
      checkCounter,
    );

    this.logger.log(
      `new status: id = ${id}, prevStatus = ${prevStatus}, status = ${status}`,
    );

    return await this.apartmentModel.findByIdAndUpdate(id, {
      $set: {
        ...updateData,
        checkedAt: moment().toDate(),
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

  async updateStreet({
    id,
    street,
  }: {
    id: string;
    street: string;
  }): Promise<Apartment> {
    this.logger.log(`update apartment street: ${id} - ${street}`);

    return await this.apartmentModel.findByIdAndUpdate(id, {
      $set: {
        street,
      },
    });
  }

  async updateStreetsSearch(): Promise<Apartment[]> {
    const apartments = await this.apartmentModel.find().exec();
    const streets = await this.streetService.findAll();

    const updatedApartments = await Promise.all(
      apartments.map(async (apartment) => {
        const street = this.getApartmentStreet(streets, apartment.address);
        return this.updateStreet({ id: apartment.id, street });
      }),
    );

    return updatedApartments;
  }

  async updateArea(id: string, areaId: string | null): Promise<Apartment> {
    return await this.apartmentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          area: areaId,
        },
      },
      {
        new: true,
      },
    );
  }

  async delete(id: string): Promise<mongodb.DeleteResult> {
    return await this.apartmentModel.deleteOne({
      _id: id,
    });
  }

  async addNewAreaToApartments(areaId: string): Promise<void> {
    const area = await this.areaModel
      .findById(areaId)
      .populate({ path: 'streetHouses', populate: { path: 'street' } })
      .exec();

    const apartmentsWithoutArea = await this.apartmentModel.find({
      area: null,
    });

    const compatibilityApartments = apartmentsWithoutArea.filter((apartment) =>
      this.findApartmentArea([area], {
        house: apartment.house,
        street: apartment.street,
      }),
    );

    await Promise.all(
      compatibilityApartments.map(async (apartment) => {
        return await this.updateArea(apartment.id, areaId.toString());
      }),
    );
  }

  getApartmentStreet(streets: IStreet[], address: string) {
    try {
      const fuse = new Fuse(streets, {
        isCaseSensitive: false,
        keys: [
          'name',
          {
            name: 'avitoName',
            weight: 2,
          },
        ],
      });

      const findedList = fuse.search(address);

      return findedList?.[0]?.item.name || '';
    } catch (e) {
      this.logger.error(e);
    }
  }

  private filterNewApartaments(
    areas: AreaResultType[],
    apartaments: IApartment[],
    existingApartaments: (Apartment &
      Document<any, any, any> & {
        _id: any;
      })[],
  ): IApartment[] {
    return apartaments.reduce<IApartment[]>((acc, curr) => {
      const isApartmentExist = existingApartaments.some(
        (item) => item.platformId === curr.platformId,
      );

      if (isApartmentExist) {
        return acc;
      }

      const area = this.findApartmentArea(areas, curr);

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
          checkedAt: moment().toDate(),
          createdAt: moment().toDate(),
        },
      ];
    }, []);
  }

  private findApartmentArea(
    areas: AreaResultType[],
    apartment: Partial<IApartment>,
  ): AreaResultType | undefined {
    const { house, street } = apartment;

    return areas.find((area) => {
      const { streetHouses } = area;

      return streetHouses.some((streetHouse) => {
        const areaStreet = streetHouse.street.name;
        const areaHouses = streetHouse.houses.map((house) =>
          house?.toLowerCase(),
        );

        if (
          areaStreet === street &&
          areaHouses.includes(house?.toLowerCase())
        ) {
          return true;
        }

        return false;
      });
    });
  }

  private getApartmentStateData(
    prevStatus: ApartmentStatusEnum,
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

      if (prevStatus === ApartmentStatusEnum.PUBLISHED) {
        return {
          status,
          checkCounter: (checkCounter || 0) + 1,
          closedAt: moment().toDate(),
        };
      }

      return {
        status,
        checkCounter: (checkCounter || 0) + 1,
      };
    }

    return {
      status,
      checkCounter,
    };
  }
}
