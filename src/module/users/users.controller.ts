import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/common/db/dto/create-user-dto';
import { IUser } from 'src/common/db/interface/user.interface';
import { CreateCustomSpaceDto } from 'src/common/db/dto/create-custom-space-dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<IUser[]> {
    return this.usersService.getAllUsers();
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<IUser> {
    return this.usersService.createUser(createUserDto);
  }

  @Post('custom_space')
  async createCustomSpace(@Body() createCustomSpaceDto: CreateCustomSpaceDto) {
    return this.usersService.createCustomSpace(createCustomSpaceDto);
  }
}
