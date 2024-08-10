import { Todo, TodoList } from '../openapi-client';

export type GetTodoList = Pick<TodoList, 'id'>;
export type AddTodo = Pick<Todo, 'todoListId' | 'title' | 'order' | 'completed'>;
export type RemoveTodo = Pick<Todo, 'id'>;
