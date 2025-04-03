import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/common/db/dto/create-user-dto';
import { IUser } from 'src/common/db/interface/user.interface';
import { CreateCustomSpaceDto } from 'src/common/db/dto/create-custom-space-dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  async getAllUsers(): Promise<IUser[]> {
    return this.usersService.getAllUsers();
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<IUser> {
    return this.usersService.createUser(createUserDto);
  }
}
