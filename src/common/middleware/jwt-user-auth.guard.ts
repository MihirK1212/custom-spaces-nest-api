import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { forwardRef, Inject } from '@nestjs/common';
import { AuthService } from 'src/module/auth/auth.service';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const STRICT_USER_MATCH_KEY = 'strictUserMatch';
export const StrictUserMatch = () => SetMetadata(STRICT_USER_MATCH_KEY, true);

@Injectable()
export class JWTUserAuthGaurd implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      if (payload['tokenPurpose'] != 'user-auth') {
        throw new UnauthorizedException();
      }

      const requireStrictMatch = this.reflector.get<boolean>(
        'strictUserMatch',
        context.getHandler(),
      );
      if (requireStrictMatch && !(payload.userId === request.params.userId)) {
        throw new UnauthorizedException();
      }

      if (!Boolean(await this.authService.isLoggedIn(payload.userId))) {
        throw new UnauthorizedException();
      }

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
