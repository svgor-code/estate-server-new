export enum ApartmentStatusEnum {
  PUBLISHED = 'published',
  CLOSED = 'closed',
  DELETED = 'deleted',
}

export interface IApartment {
  platformId: string;
  title: string;
  href: string;
  price: number;
  pricePerMeter: number;
  street: string;
  house: string;
  rooms?: number;
  square: number;
  floor?: number;
  area?: string;
  status?: ApartmentStatusEnum;
  checkCounter?: number;
  checkedAt?: Date;
}
