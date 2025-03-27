import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { CreateCustomSpaceDto } from 'src/common/db/dto/create-custom-space-dto';
import { CreateUserDto } from 'src/common/db/dto/create-user-dto';
import { CustomSpace } from 'src/common/db/entity/custom-space.schema';
import { User } from 'src/common/db/entity/user.model';
import { IUser } from 'src/common/db/interface/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectModel(CustomSpace.name) private customSpaceModel: Model<CustomSpace>,
  ) {}

  async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.find();
  }

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  async createCustomSpace(createCustomSpaceDto: CreateCustomSpaceDto) {
    const createdSpace = new this.customSpaceModel(createCustomSpaceDto);
    return createdSpace.save();
  }
}
