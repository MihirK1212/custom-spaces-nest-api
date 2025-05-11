import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthMethod } from './auth-method.model';

@Entity()
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: 'google' | 'facebook' | 'github';

  @Column()
  providerUserId: string;

  @Column()
  email: string;

  @OneToOne(() => AuthMethod, (authMethod) => authMethod.oauthAccount, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  authMethod: AuthMethod;
}
