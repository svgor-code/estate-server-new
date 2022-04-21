import { ApartmentRingStatusEnum } from 'src/interfaces/apartment.interface';

export class UpdateApartmentRingStatusDto {
  id: string;
  ringStatus: ApartmentRingStatusEnum;
}
