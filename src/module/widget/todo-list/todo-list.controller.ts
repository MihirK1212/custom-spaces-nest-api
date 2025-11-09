// todo.controller.ts
import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { CreateTodoItemDto, UpdateTodoItemDto } from 'src/common/dto/widget/todo-list/todo-list.dto';
import { UserSpacePermissionRole } from 'src/common/enums/user-space-permission-role.enum';
import { UseGuards } from '@nestjs/common';
import { JWTUserAuthGaurd } from 'src/common/middleware/jwt-user-auth.guard';
import { CustomSpacePermissionGaurd, SetCustomSpaceAllowedRoles } from 'src/common/middleware/custom-space-permission-gaurd';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/widgets/todo')
export class TodoListController {
  constructor(private readonly todoListService: TodoListService) {}

  @UseGuards(JWTUserAuthGaurd, CustomSpacePermissionGaurd)
  @SetCustomSpaceAllowedRoles([
      UserSpacePermissionRole.OWNER,
      UserSpacePermissionRole.ADMIN,
      UserSpacePermissionRole.WRITE
  ])
  @ApiBearerAuth('access-token')
  @Post(':widgetId')
  createItem(@Param('widgetId') widgetId: string, @Body() dto: CreateTodoItemDto) {
    return this.todoListService.addItem(widgetId, dto);
  }

  @UseGuards(JWTUserAuthGaurd, CustomSpacePermissionGaurd)
  @SetCustomSpaceAllowedRoles([
      UserSpacePermissionRole.READ,
      UserSpacePermissionRole.OWNER,
      UserSpacePermissionRole.ADMIN,
      UserSpacePermissionRole.WRITE
  ])
  @ApiBearerAuth('access-token')
  @Get(':widgetId')
  getItems(@Param('widgetId') widgetId: string) {
    return this.todoListService.getItems(widgetId);
  }

  @UseGuards(JWTUserAuthGaurd, CustomSpacePermissionGaurd)
  @SetCustomSpaceAllowedRoles([
      UserSpacePermissionRole.OWNER,
      UserSpacePermissionRole.ADMIN,
      UserSpacePermissionRole.WRITE
  ])
  @ApiBearerAuth('access-token')
  @Patch('item/:widgetId/:itemId')
  updateItem(@Param('widgetId') widgetId: string, @Param('itemId') itemId: string, @Body() dto: UpdateTodoItemDto) {
    return this.todoListService.updateItem(itemId, dto);
  }

  @UseGuards(JWTUserAuthGaurd, CustomSpacePermissionGaurd)
  @SetCustomSpaceAllowedRoles([
      UserSpacePermissionRole.OWNER,
      UserSpacePermissionRole.ADMIN,
      UserSpacePermissionRole.WRITE
  ])
  @ApiBearerAuth('access-token')
  @Delete('item/:widgetId/:itemId')
  deleteItem(@Param('widgetId') widgetId: string, @Param('itemId') itemId: string) {
    return this.todoListService.deleteItem(itemId);
  }
}
