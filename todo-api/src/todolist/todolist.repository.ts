import { Repository } from 'typeorm';
import { TodoList } from './entities/todolist.entity';

export class TodolistRepository extends Repository<TodoList> {}
