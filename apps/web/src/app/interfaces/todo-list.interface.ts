import { TodoList } from "../openapi-client/model/todo-list";

export type GetTodoList = Pick<TodoList, 'id'>;
export type AddTodoList = Pick<TodoList, 'title'>;
export type RemoveTodoList = Pick<TodoList, 'id'>;
