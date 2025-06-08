import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from '../../common/dto/user/user.dto';
import { User } from '../../common/entity/user/user.model';
import { JWTUserAuthGaurd, StrictUserMatch } from 'src/common/middleware/jwt-user-auth.guard';

@ApiTags('User')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get  All Users' })
  @Get('all')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JWTUserAuthGaurd)
  @StrictUserMatch()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<User> {
    return this.userService.getUser({ where: { id: userId } });
  }

  @UseGuards(JWTUserAuthGaurd)
  @StrictUserMatch()
  @ApiOperation({ summary: 'Update existing user' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(userId, updateUserDto); 
  }
}
