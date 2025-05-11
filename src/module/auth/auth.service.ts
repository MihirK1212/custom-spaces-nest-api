import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthMethod } from '../../common/data/entity/auth/auth-method.model';
import { PasswordAuth } from '../../common/data/entity/auth/password-auth.model';
import {
  UpdatePasswordAuthDto,
  UsernamePasswordAuthDto,
} from '../../common/data/dto/password-auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/common/data/entity/user.model';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { JWTLoginStatus } from 'src/common/data/entity/auth/jwt-login-status';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private jwtService: JwtService,
    @InjectRepository(AuthMethod)
    private readonly authMethodRepository: Repository<AuthMethod>,
    @InjectRepository(PasswordAuth)
    private readonly passwordAuthRepository: Repository<PasswordAuth>,
    @InjectRepository(JWTLoginStatus)
    private readonly jwtLoginStatusRepository: Repository<JWTLoginStatus>,
  ) {}

  async registerWithPassword(
    createUserPasswordAuthDto: UsernamePasswordAuthDto,
  ): Promise<{ user_id: string; access_token: string }> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { username, password } = createUserPasswordAuthDto;

      const user = queryRunner.manager.create(User, { username });
      await queryRunner.manager.save(user);

      const existingAuthMethod = await queryRunner.manager.findOne(AuthMethod, {
        where: { user, methodType: 'password' },
      });

      if (existingAuthMethod) {
        throw new BadRequestException(
          'Password authentication already exists for this user',
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const passwordAuth = queryRunner.manager.create(PasswordAuth, {
        passwordHash,
      });

      const authMethod = queryRunner.manager.create(AuthMethod, {
        user,
        methodType: 'password',
        passwordAuth,
      });

      await queryRunner.manager.save(authMethod);

      const payload = {
        sub: user.id,
        username: user.username,
        authMethodId: authMethod.id,
        tokenPurpose: 'user-auth',
      };

      const access_token = await this.jwtService.signAsync(payload);

      await this.logoutUser(user.id);

      await queryRunner.commitTransaction();

      return { user_id: user.id, access_token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async authenticateWithPassword(
    loginUserPasswordAuthDto: UsernamePasswordAuthDto,
  ): Promise<{ user_id: string; access_token: string }> {
    const { username, password } = loginUserPasswordAuthDto;

    const passwordAuth = await this.passwordAuthRepository.findOne({
      where: { authMethod: { user: { username } } },
      relations: ['authMethod', 'authMethod.user'],
    });

    if (!passwordAuth) {
      throw new UnauthorizedException(
        'Invalid credentials - passwordAuth does not exist',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      passwordAuth.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials - password does not match',
      );
    }

    const user = passwordAuth.authMethod.user;
    const authMethod = passwordAuth.authMethod;

    await this.loginUser(user.id)

    const payload = {
      sub: user.id,
      username: user.username,
      authMethodId: authMethod.id,
      tokenPurpose: 'user-auth',
    };
    return {
      user_id: user.id,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async updatePasswordAuth(
    id: string,
    updatePasswordAuthDto: UpdatePasswordAuthDto,
  ): Promise<void> {
    const authMethod = await this.authMethodRepository.findOne({
      where: {
        user: { id },
        methodType: 'password',
      },
      relations: ['passwordAuth'],
    });

    if (!authMethod || !authMethod.passwordAuth) {
      throw new NotFoundException(
        'Password authentication not found for this user',
      );
    }

    authMethod.passwordAuth.passwordHash = await bcrypt.hash(
      updatePasswordAuthDto.password,
      10,
    );

    await this.passwordAuthRepository.save(authMethod.passwordAuth);
    await this.logoutUser(id);
  }

  async loginUser(id: string): Promise<void> {
    const status = await this.jwtLoginStatusRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (status) {
      status.isLoggedIn = true;
      await this.jwtLoginStatusRepository.save(status);
    } else {
      const newStatus = this.jwtLoginStatusRepository.create({
        user: { id },
        isLoggedIn: true,
      });
      await this.jwtLoginStatusRepository.save(newStatus);
    }
  }

  async logoutUser(id: string): Promise<void> {
    const status = await this.jwtLoginStatusRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (status) {
      status.isLoggedIn = false;
      await this.jwtLoginStatusRepository.save(status);
    }
  }

  async isLoggedIn(id: string): Promise<boolean> {
    const status = await this.jwtLoginStatusRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });
    
    return status?.isLoggedIn ?? false;
  }
}
