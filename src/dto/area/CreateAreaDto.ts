import { CreateStreetHouseDto } from '../streetHouse/CreateStreetHouseDto';

export class CreateAreaDto {
  name: string;
  pricePerMeter: number;
  streetHouses: CreateStreetHouseDto[];
}
