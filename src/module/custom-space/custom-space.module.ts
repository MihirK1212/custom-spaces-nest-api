import { Module } from '@nestjs/common';
import { CustomSpaceController } from './custom-space.controller';
import { CustomSpaceService } from './custom-space.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomSpace,
  CustomSpaceSchema,
} from 'src/common/data/entity/custom-space.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomSpace.name, schema: CustomSpaceSchema },
    ]),
  ],
  controllers: [CustomSpaceController],
  providers: [CustomSpaceService],
})
export class CustomSpaceModule {}
