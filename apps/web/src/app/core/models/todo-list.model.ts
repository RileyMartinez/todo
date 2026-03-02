import { TodoListResponseDto } from '../../shared/openapi-client/model/todo-list-response-dto';

export type GetTodoList = Pick<TodoListResponseDto, 'id'>;
export type AddTodoList = Pick<TodoListResponseDto, 'title' | 'icon' | 'order'>;
export type RemoveTodoList = Pick<TodoListResponseDto, 'id'>;
