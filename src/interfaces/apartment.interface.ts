export type ApartmentStatus = 'published' | 'not-published' | 'deleted';

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
  status?: ApartmentStatus;
}
