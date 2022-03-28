import { CreateStreetHouseDto } from '../streetHouse/CreateStreetHouseDto';

export class CreateAreaDto {
  name: string;
  description: string;
  streetHouses: CreateStreetHouseDto[];
}
