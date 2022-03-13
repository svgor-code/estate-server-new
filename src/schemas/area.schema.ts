import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { StreetHouse } from './streetHouse.schema';

export type AreaDocument = Area & Document;

@Schema()
export class Area {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, require: true })
  pricePerMeter: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StreetHouse' }],
  })
  streetHouses: StreetHouse[];
}

export const AreaSchema = SchemaFactory.createForClass(Area);
