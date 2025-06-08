import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.model';
import { PasswordAuth } from './password-auth.model';
import { OAuthAccount } from './oauth-account.model';

@Entity()
export class AuthMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.authMethods, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  methodType: 'password' | 'google' | 'facebook' | 'github';

  @OneToOne(() => PasswordAuth, (passwordAuth) => passwordAuth.authMethod, {
    cascade: true,
  })
  passwordAuth: PasswordAuth;

  @OneToOne(() => OAuthAccount, (oauthAccount) => oauthAccount.authMethod, {
    cascade: true,
  })
  oauthAccount: OAuthAccount;
}
