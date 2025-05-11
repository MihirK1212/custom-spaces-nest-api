import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto {
  @ApiProperty({ description: 'Unique username', example: 'john_doe' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'http://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  profilePictureUrl?: string;
}
