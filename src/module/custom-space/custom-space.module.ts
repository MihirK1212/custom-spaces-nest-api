import { forwardRef, Module } from '@nestjs/common';
import { CustomSpaceController } from './custom-space.controller';
import { CustomSpaceService } from './custom-space.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
    CustomSpace,
    CustomSpaceSchema
} from 'src/common/entity/custom-space/custom-space.schema';
import {
    SpacePermission,
    SpacePermissionSchema
} from 'src/common/entity/custom-space/space-permission.schema';
import {
    Widget,
    WidgetSchema
} from 'src/common/entity/custom-space/widget.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CustomSpace.name, schema: CustomSpaceSchema },
            { name: Widget.name, schema: WidgetSchema },
            { name: SpacePermission.name, schema: SpacePermissionSchema }
        ]),
        forwardRef(() => AuthModule)
    ],
    controllers: [CustomSpaceController],
    providers: [CustomSpaceService]
})
export class CustomSpaceModule {}
