import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/db/entity/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomSpace, CustomSpaceSchema } from 'src/common/db/entity/custom-space.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([{ name: CustomSpace.name, schema: CustomSpaceSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
