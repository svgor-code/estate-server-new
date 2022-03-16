import { Model, Document } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Apartment, ApartmentDocument } from 'src/schemas/apartment.schema';
import { Area, AreaDocument } from 'src/schemas/area.schema';
import { CreateApartmentDto } from 'src/dto/apartment/CreateApartmentDto';
import { IApartment } from 'src/interfaces/apartment.interface';

type AreaResultType = Area &
  Document<any, any, any> & {
    _id: any;
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

  async findAll(): Promise<Apartment[]> {
    return this.apartmentModel.find().exec();
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
          status: 'published',
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
}
