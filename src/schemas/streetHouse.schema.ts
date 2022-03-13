import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Street } from './street.schema';

export type StreetHouseDocument = StreetHouse & Document;

@Schema()
export class StreetHouse {
  @Prop({ type: [String] })
  houses: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Street' })
  street: Street;
}

export const StreetHouseSchema = SchemaFactory.createForClass(StreetHouse);
