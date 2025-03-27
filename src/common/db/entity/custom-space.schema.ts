import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument  } from 'mongoose';

export type CustomSpaceDocument = HydratedDocument<CustomSpace>;

@Schema()
export class CustomSpace {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;
}

export const CustomSpaceSchema = SchemaFactory.createForClass(CustomSpace);
