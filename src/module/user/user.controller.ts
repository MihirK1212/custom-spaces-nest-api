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
import { UpdateUserDto } from '../../common/data/dto/user.dto';
import { User } from '../../common/data/entity/user.model';
import { JWTUserAuthGaurd } from 'src/common/middleware/jwt-user-auth.guard';

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
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'User ID' })
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUser({ where: { id } });
  }

  @UseGuards(JWTUserAuthGaurd)
  @ApiOperation({ summary: 'Update existing user' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'User ID' })
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto); 
  }
}
