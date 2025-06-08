import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CustomSpace } from './custom-space.schema';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';


export type SpacePermissionDocument = HydratedDocument<SpacePermission>;

@Schema({ timestamps: true })
export class SpacePermission {
  @Prop({ type: Types.ObjectId, ref: CustomSpace.name, required: true })
  space: Types.ObjectId;

  // User ID from external SQL system
  @Prop({ required: true }) 
  userId: string; // Store unique user identifier (UUID, numeric ID, email, etc.)

  @Prop({ required: true, enum: UserSpacePermissionRole })
  role: UserSpacePermissionRole;
}

export const SpacePermissionSchema = SchemaFactory.createForClass(SpacePermission);
