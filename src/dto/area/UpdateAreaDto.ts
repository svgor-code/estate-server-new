import { CreateStreetHouseDto } from '../streetHouse/CreateStreetHouseDto';

export class UpdateAreaDto {
  name: string;
  description: string;
  streetHouses: CreateStreetHouseDto[];
}
