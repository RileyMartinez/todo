import { OmitType } from '@nestjs/swagger';
import { Todo } from '../entities/todo.entity';

export class TodoDto extends OmitType(Todo, ['todoList'] as const) {}
