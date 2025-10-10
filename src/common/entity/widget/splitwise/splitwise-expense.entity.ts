import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SplitwiseGroup } from './splitwise-group.entity';
import { SplitwiseMember } from './splitwise-member.entity';
import { SplitwiseExpenseAllocation } from './splitwise-expense-allocation.entity';

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENT';

const decimalTransformer = {
  to: (v?: number) => v,
  from: (v?: string | null) => (v ? parseFloat(v) : 0),
};

@Entity()
export class SplitwiseExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SplitwiseGroup, (group) => group.expenses, { onDelete: 'CASCADE' })
  group: SplitwiseGroup;

  @ManyToOne(() => SplitwiseMember, { eager: true, onDelete: 'CASCADE' })
  paidBy: SplitwiseMember;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'varchar' })
  splitType: SplitType;

  @OneToMany(() => SplitwiseExpenseAllocation, (allocation) => allocation.expense, { cascade: true })
  allocations: SplitwiseExpenseAllocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


