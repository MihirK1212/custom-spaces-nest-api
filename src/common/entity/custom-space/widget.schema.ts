import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WidgetType } from 'src/common/enums/widget-type.enum';


@Schema({ timestamps: true })
export class Widget {
  @Prop({ required: true, enum: WidgetType })
  widgetType: WidgetType; // e.g., 'chat', 'coworking', 'photo-storage'

  @Prop({ required: true })
  displayName: string; // e.g., 'Chat Widget', 'Photo Storage'

  @Prop()
  description?: string;

  @Prop({ type: Map, of: String }) // Optional metadata (could also use a JSON object)
  defaultConfig?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'CustomSpace', required: true })
  space: Types.ObjectId;
}

export const WidgetSchema = SchemaFactory.createForClass(Widget);
export type WidgetDocument = HydratedDocument<Widget>;
