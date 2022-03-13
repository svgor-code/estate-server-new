import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApartmentStateDocument = ApartmentState & Document;

@Schema()
export class ApartmentState {
  @Prop({ type: String, required: true })
  name: string;
}

export const ApartmentStateSchema =
  SchemaFactory.createForClass(ApartmentState);
