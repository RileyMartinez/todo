export * from './auth.client';
import { AuthClient } from './auth.client';
export * from './default.client';
import { DefaultClient } from './default.client';
export * from './todo-list.client';
import { TodoListClient } from './todo-list.client';
export * from './user.client';
import { UserClient } from './user.client';
export const APIS = [AuthClient, DefaultClient, TodoListClient, UserClient];
