import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.model';

@Entity()
export class JWTLoginStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.jwtLoginStatus, {cascade: true})
  @JoinColumn()
  user: User;
  
  @Column()
  isLoggedIn: boolean;
}
