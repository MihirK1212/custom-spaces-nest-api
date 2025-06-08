// todo.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from 'src/common/entity/widget/todo-list/todo-list.entity';
import { TodoItem } from 'src/common/entity/widget/todo-list/todo-item.entity';
import { CreateTodoItemDto, UpdateTodoItemDto } from 'src/common/dto/widget/todo-list/todo-list.dto';

@Injectable()
export class TodoListService {
  constructor(
    @InjectRepository(TodoList)
    private listRepo: Repository<TodoList>,
    @InjectRepository(TodoItem)
    private itemRepo: Repository<TodoItem>,
  ) {}

  async getOrCreateList(widgetId: string): Promise<TodoList> {
    let list = await this.listRepo.findOne({ where: { widgetId }, relations: ['items'] });
    if (!list) {
      list = this.listRepo.create({ widgetId });
      await this.listRepo.save(list);
    }
    return list;
  }

  async addItem(widgetId: string, dto: CreateTodoItemDto): Promise<TodoItem> {
    const list = await this.getOrCreateList(widgetId);
    const item = this.itemRepo.create({ ...dto, list });
    return this.itemRepo.save(item);
  }

  async getItems(widgetId: string): Promise<TodoItem[]> {
    const list = await this.getOrCreateList(widgetId);
    return this.itemRepo.find({ where: { list: { id: list.id } } });
  }

  async updateItem(itemId: string, dto: UpdateTodoItemDto): Promise<TodoItem> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async deleteItem(itemId: string): Promise<void> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    await this.itemRepo.remove(item);
  }
}
