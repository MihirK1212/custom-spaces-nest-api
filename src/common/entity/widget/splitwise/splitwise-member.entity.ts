import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SplitwiseGroup } from './splitwise-group.entity';

@Entity()
@Unique(['group', 'userId'])
export class SplitwiseMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  displayName?: string;

  @ManyToOne(() => SplitwiseGroup, (group) => group.members, { onDelete: 'CASCADE' })
  group: SplitwiseGroup;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


