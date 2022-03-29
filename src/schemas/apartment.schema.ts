import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import moment from 'moment';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ApartmentStatusEnum } from 'src/interfaces/apartment.interface';
import { ApartmentState } from './apartmentState.schema';
import { Area } from './area.schema';

export type ApartmentDocument = Apartment & Document;

@Schema()
export class Apartment {
  @Prop({ type: String, required: true })
  platformId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  href: string;

  @Prop({ type: Number, require: true })
  price: number;

  @Prop({ type: Number, require: true })
  pricePerMeter: number;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  street: string;

  @Prop({ type: String, required: true })
  house: string;

  @Prop({ type: Number })
  rooms: number;

  @Prop({ type: Number })
  square: number;

  @Prop({ type: Number })
  floor: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true })
  area: Area;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ApartmentState' })
  state: ApartmentState;

  @Prop({
    type: String,
    enum: ApartmentStatusEnum,
    required: true,
  })
  status: ApartmentStatusEnum;

  @Prop({ type: Number })
  checkCounter: number;

  @Prop({ type: Date })
  checkedAt: Date;

  @Prop({ type: Date, required: true, default: moment().toDate() })
  createdAt: Date;
}

export const ApartmentSchema = SchemaFactory.createForClass(Apartment);
