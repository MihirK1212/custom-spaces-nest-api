// todo.controller.ts
import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { CreateTodoItemDto, UpdateTodoItemDto } from 'src/common/dto/widget/todo-list/todo-list.dto';

@Controller('api/widgets/todo')
export class TodoListController {
  constructor(private readonly todoListService: TodoListService) {}

  @Post(':widgetId')
  createItem(@Param('widgetId') widgetId: string, @Body() dto: CreateTodoItemDto) {
    return this.todoListService.addItem(widgetId, dto);
  }

  @Get(':widgetId')
  getItems(@Param('widgetId') widgetId: string) {
    return this.todoListService.getItems(widgetId);
  }

  @Patch('item/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateTodoItemDto) {
    return this.todoListService.updateItem(itemId, dto);
  }

  @Delete('item/:itemId')
  deleteItem(@Param('itemId') itemId: string) {
    return this.todoListService.deleteItem(itemId);
  }
}
