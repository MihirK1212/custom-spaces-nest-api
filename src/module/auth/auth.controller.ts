import { Controller, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdatePasswordAuthDto } from '../../common/dto/auth/password-auth.dto';
import { UsernamePasswordAuthDto } from 'src/common/dto/auth/password-auth.dto';
import {
  JWTUserAuthGaurd,
  StrictUserMatch,
} from '../../common/middleware/jwt-user-auth.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register user with password authentication' })
  @Post('register/password-auth')
  async passwordRegister(
    @Body() createUserPasswordAuthDto: UsernamePasswordAuthDto,
  ): Promise<{ access_token: string }> {
    return this.authService.registerWithPassword(createUserPasswordAuthDto);
  }

  @ApiOperation({ summary: 'Login using password' })
  @Post('login/password-auth')
  async passwordLogin(
    @Body() loginUserPasswordAuthDto: UsernamePasswordAuthDto,
  ): Promise<{ access_token: string }> {
    return this.authService.authenticateWithPassword(loginUserPasswordAuthDto);
  }

  @UseGuards(JWTUserAuthGaurd)
  @StrictUserMatch()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update password authentication for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Put('update/password-auth/:userId')
  async updatePasswordAuth(
    @Param('userId') userId: string,
    @Body() updatePasswordAuthDto: UpdatePasswordAuthDto,
  ): Promise<void> {
    await this.authService.updatePasswordAuth(userId, updatePasswordAuthDto);
  }
}
