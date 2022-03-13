import { CreateStreetHouseDto } from '../streetHouse/CreateStreetHouseDto';

export class UpdateAreaDto {
  name: string;
  pricePerMeter: number;
  streetHouses: CreateStreetHouseDto[];
}
