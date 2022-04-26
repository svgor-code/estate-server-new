import { ApartmentStatusEnum } from 'src/interfaces/apartment.interface';

export class GetApartmentDto {
  status?: ApartmentStatusEnum;
  area?: string;
  offset?: number;
  limit?: number;
}
