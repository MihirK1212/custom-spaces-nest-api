import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/db/entity/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomSpace, CustomSpaceSchema } from 'src/common/db/entity/custom-space.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
