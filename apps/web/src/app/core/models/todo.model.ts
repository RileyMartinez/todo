import { TodoResponseDto } from '../../shared/openapi-client/model/todo-response-dto';

export type AddTodo = Pick<TodoResponseDto, 'todoListId' | 'title' | 'order' | 'completed'>;
export type RemoveTodo = Pick<TodoResponseDto, 'id'>;
