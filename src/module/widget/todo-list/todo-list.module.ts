import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from 'src/common/entity/widget/todo-list/todo-list.entity';
import { TodoItem } from 'src/common/entity/widget/todo-list/todo-item.entity';
import { TodoListService } from './todo-list.service';
import { TodoListController } from './todo-list.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TodoItem, TodoList])],
  controllers: [TodoListController],
  providers: [TodoListService],
})
export class TodoListModule {}
