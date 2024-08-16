import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TodoListRepository } from './todo-list.repository';
import { DeleteResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { ExceptionConstants } from 'src/common/constants';
import { TodoDto, TodoListDto } from './dto';
import { Todo } from './entities';

@Injectable()
export class TodoListService {
    constructor(private readonly todolistRepository: TodoListRepository) {}

    async saveTodoList(userId: number, todoListDto: TodoListDto): Promise<TodoList> {
        if (userId < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.todolistRepository.saveTodoList(userId, todoListDto);
    }

    async saveTodoListItem(todoDto: TodoDto): Promise<Todo> {
        return await this.todolistRepository.saveTodoListItem(todoDto);
    }

    async findTodoLists(userId: number): Promise<TodoList[]> {
        if (userId < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const todoLists = await this.todolistRepository.findTodoLists(userId);

        if (!todoLists || todoLists.length === 0) {
            throw new NotFoundException('No todo lists found');
        }

        return todoLists;
    }

    async findTodoList(id: number): Promise<TodoList | null> {
        if (id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
        }

        return await this.todolistRepository.findTodoList(id);
    }

    async deleteTodoList(id: number): Promise<DeleteResult> {
        return await this.todolistRepository.deleteTodoList(id);
    }

    async deleteTodoListItem(id: number): Promise<DeleteResult> {
        return await this.todolistRepository.deleteTodoListItem(id);
    }
}
