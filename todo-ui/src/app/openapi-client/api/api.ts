export * from './auth.service';
import { AuthService } from './auth.service';
export * from './default.service';
import { DefaultService } from './default.service';
export * from './todo.service';
import { TodoService } from './todo.service';
export * from './todolist.service';
import { TodolistService } from './todolist.service';
export * from './users.service';
import { UsersService } from './users.service';
export const APIS = [
    AuthService,
    DefaultService,
    TodoService,
    TodolistService,
    UsersService,
];
