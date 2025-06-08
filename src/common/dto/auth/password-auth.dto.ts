import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class UsernamePasswordAuthDto {
  @ApiProperty({ description: 'Unique username', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password', example: 'strongPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}


export class UpdatePasswordAuthDto {
  @ApiProperty({ description: 'Password', example: 'strongPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
