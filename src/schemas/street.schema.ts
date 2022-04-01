import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StreetDocument = Street & Document;

@Schema()
export class Street {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, unique: true })
  avitoName: string;
}

export const StreetSchema = SchemaFactory.createForClass(Street);
