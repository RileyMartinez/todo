import { TodoList } from '../openapi-client';

export type GetTodoList = Pick<TodoList, 'id'>;
export type AddTodoList = Pick<TodoList, 'title'>;
export type RemoveTodoList = Pick<TodoList, 'id'>;
