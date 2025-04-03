import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/common/db/dto/create-user-dto';
import { User } from 'src/common/db/entity/user.model';
import { IUser } from 'src/common/db/interface/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.find();
  }

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }
}
