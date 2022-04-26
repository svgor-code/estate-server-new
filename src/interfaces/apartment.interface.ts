import { Document } from 'mongoose';
import { Apartment } from 'src/schemas/apartment.schema';
import { Area } from 'src/schemas/area.schema';

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
  UNCONFIRMED = 'unconfirmed',
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

export type AreaResultType = Area &
  Document<any, any, any> & {
    _id: any;
  };

export type ApartmentResultType = Apartment &
  Document<any, any, any> & {
    _id: any;
  };

export type ApartmentFindWrapper = {
  items: ApartmentResultType[];
  count: number;
};

export type ApartmentUpdateStatusType = {
  status: ApartmentStatusEnum;
  checkCounter: number;
  closedAt?: Date;
};
