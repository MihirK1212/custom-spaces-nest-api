import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { User } from '../../common/data/entity/user.model';
import { AuthMethod } from '../../common/data/entity/auth/auth-method.model';
import { PasswordAuth } from '../../common/data/entity/auth/password-auth.model';
import { OAuthAccount } from '../../common/data/entity/auth/oauth-account.model';
import { UpdateUserDto } from '../../common/data/dto/user.dto';
import { PasswordAuthDto } from '../../common/data/dto/password-auth.dto';
import { OAuthAuthDto } from '../../common/data/dto/oauth-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUser(options: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(options);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.getUser({ where: { id } });
  }
}
