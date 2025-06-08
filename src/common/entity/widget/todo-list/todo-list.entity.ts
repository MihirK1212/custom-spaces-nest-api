// todo-list.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TodoItem } from './todo-item.entity';

@Entity()
export class TodoList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  widgetId: string;

  @OneToMany(() => TodoItem, item => item.list, { cascade: true })
  items: TodoItem[];
}
