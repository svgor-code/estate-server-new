import { ApartmentStatusEnum } from 'src/interfaces/apartment.interface';

export class UpdateApartmentStatusDto {
  id: string;
  status: ApartmentStatusEnum;
}
