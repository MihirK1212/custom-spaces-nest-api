import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from 'src/common/entity/widget/todo-list/todo-list.entity';
import { TodoItem } from 'src/common/entity/widget/todo-list/todo-item.entity';
import { TodoListService } from './todo-list.service';
import { TodoListController } from './todo-list.controller';
import { AuthModule } from 'src/module/auth/auth.module';
import { UserModule } from 'src/module/user/user.module';
import { CustomSpaceModule } from 'src/module/custom-space/custom-space.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([TodoItem, TodoList]),
    forwardRef(() => AuthModule),
      UserModule,
      CustomSpaceModule
  ],
  controllers: [TodoListController],
  providers: [TodoListService],
})
export class TodoListModule {}
