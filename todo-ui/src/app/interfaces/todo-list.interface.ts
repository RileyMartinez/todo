import { TodoList } from '../openapi-client';

export type AddTodoList = Pick<TodoList, 'title'>;
export type RemoveTodoList = Pick<TodoList, 'id'>;
