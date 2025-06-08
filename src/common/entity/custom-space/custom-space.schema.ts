import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CustomSpaceDocument = HydratedDocument<CustomSpace>;

@Schema({ timestamps: true })
export class CustomSpace {
  @Prop({ required: true })
  name: string;

  // Optional: Description or purpose of the space
  @Prop()
  description?: string;

  //Reference to widgets
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Widget' }] })
  widgets: Types.ObjectId[];

  // Reference to permission documents
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'SpacePermission' }],
    default: [],
  })
  permissions: Types.ObjectId[];
}

export const CustomSpaceSchema = SchemaFactory.createForClass(CustomSpace);
