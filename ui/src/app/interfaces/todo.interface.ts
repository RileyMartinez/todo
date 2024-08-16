import { Todo } from '../openapi-client';

export type AddTodo = Pick<Todo, 'todoListId' | 'title' | 'order' | 'completed'>;
export type RemoveTodo = Pick<Todo, 'id'>;
