import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateCustomSpaceDto {
  @ApiProperty({ description: 'Custom Space Name', example: 'Summer Vacation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Custom Space Description', example: 'Planning for Summer Vacation' })
  @IsString()
  description?: string;
}


export class UpdateCustomSpaceDto {
  @ApiProperty({ description: 'Custom Space Name', example: 'Summer Vacation' })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Custom Space Description', example: 'Planning for Summer Vacation' })
  @IsString()
  description?: string;
}
