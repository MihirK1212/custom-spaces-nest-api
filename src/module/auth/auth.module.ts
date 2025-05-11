import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMethod } from '../../common/data/entity/auth/auth-method.model';
import { PasswordAuth } from '../../common/data/entity/auth/password-auth.model';
import { OAuthAccount } from '../../common/data/entity/auth/oauth-account.model';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/common/data/entity/user.model';
import { ConfigModule } from '@nestjs/config';
import { JWTLoginStatus } from 'src/common/data/entity/auth/jwt-login-status';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './env/.env.development.local'
    }),
    TypeOrmModule.forFeature([User, AuthMethod, PasswordAuth, OAuthAccount, JWTLoginStatus]),
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
