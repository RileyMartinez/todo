import { Todo } from "../openapi-client/model/todo";

export type AddTodo = Pick<Todo, 'todoListId' | 'title' | 'order' | 'completed'>;
export type RemoveTodo = Pick<Todo, 'id'>;
