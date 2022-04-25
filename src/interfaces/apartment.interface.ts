export enum ApartmentStatusEnum {
  PUBLISHED = 'published',
  CLOSED = 'closed',
  DELETED = 'deleted',
}

export enum ApartmentRingStatusEnum {
  SUCCESS = 'success',
  IN_PROGRESS = 'in_progress',
  FAIL = 'fail',
  FAKE = 'fake',
  CONFIRMED = 'confirmed',
}

export interface IApartment {
  platformId: string;
  title: string;
  href: string;
  price: number;
  pricePerMeter: number;
  address: string;
  street: string;
  house: string;
  rooms?: number;
  square: number;
  floor?: number;
  area?: string;
  status?: ApartmentStatusEnum;
  ringStatus?: ApartmentRingStatusEnum;
  checkCounter?: number;
  checkedAt?: Date;
  createdAt?: Date;
  closedAt?: Date;
}
