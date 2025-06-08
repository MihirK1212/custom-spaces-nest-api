import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AuthMethod } from '../auth/auth-method.model';
import { JWTLoginStatus } from '../auth/jwt-login-status';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @OneToMany(() => AuthMethod, (authMethod) => authMethod.user, {
    cascade: true,
  })
  authMethods: AuthMethod[];

  @OneToOne(() => JWTLoginStatus, (jwtLoginStatus) => jwtLoginStatus.user, { onDelete: 'CASCADE' })
  jwtLoginStatus: JWTLoginStatus
}
