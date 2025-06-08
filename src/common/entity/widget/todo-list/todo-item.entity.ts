// todo-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TodoList } from './todo-list.entity';

@Entity()
export class TodoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => TodoList, list => list.items, { onDelete: 'CASCADE' })
  list: TodoList;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
