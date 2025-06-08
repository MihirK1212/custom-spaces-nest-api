import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class OAuthAuthDto {
  @ApiProperty({ description: 'OAuth provider', example: 'google' })
  @IsString()
  @IsNotEmpty()
  provider: 'google' | 'facebook' | 'github';

  @ApiProperty({ description: 'Provider user ID', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  providerUserId: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
