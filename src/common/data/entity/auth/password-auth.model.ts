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
export class PasswordAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  passwordHash: string;

  @OneToOne(() => AuthMethod, (authMethod) => authMethod.passwordAuth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  authMethod: AuthMethod;
}
