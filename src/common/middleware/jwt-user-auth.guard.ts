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

@Injectable()
export class JWTUserAuthGaurd implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
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

      if(!(payload.sub === request.params.id)) {
        throw new UnauthorizedException()
      }

      if(!Boolean(await this.authService.isLoggedIn(payload.sub))) {
        throw new UnauthorizedException()
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
