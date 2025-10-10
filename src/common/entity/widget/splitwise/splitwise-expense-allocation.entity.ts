import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { SplitwiseExpense } from './splitwise-expense.entity';
import { SplitwiseMember } from './splitwise-member.entity';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity()
@Unique(['expense', 'member'])
export class SplitwiseExpenseAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SplitwiseExpense, (expense) => expense.allocations, { onDelete: 'CASCADE' })
  expense: SplitwiseExpense;

  @ManyToOne(() => SplitwiseMember, { eager: true, onDelete: 'CASCADE' })
  member: SplitwiseMember;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number; // amount owed by member for this expense
}


