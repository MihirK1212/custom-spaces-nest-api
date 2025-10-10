import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { SplitwiseMember } from './splitwise-member.entity';
import { SplitwiseExpense } from './splitwise-expense.entity';

@Entity()
export class SplitwiseGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  widgetId: string;

  @OneToMany(() => SplitwiseMember, (member) => member.group, { cascade: true })
  members: SplitwiseMember[];

  @OneToMany(() => SplitwiseExpense, (expense) => expense.group, { cascade: true })
  expenses: SplitwiseExpense[];
}


