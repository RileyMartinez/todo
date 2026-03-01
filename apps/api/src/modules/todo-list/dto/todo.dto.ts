import { OmitType } from '@nestjs/swagger';
import { Todo } from '@/modules/todo-list/entities/todo.entity';

export class TodoDto extends OmitType(Todo, ['todoList'] as const) {}
