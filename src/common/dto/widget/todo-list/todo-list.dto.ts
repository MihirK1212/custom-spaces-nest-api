// create-todo-item.dto.ts
export class CreateTodoItemDto {
  content: string;
}

// update-todo-item.dto.ts
export class UpdateTodoItemDto {
  content?: string;
  isCompleted?: boolean;
}
