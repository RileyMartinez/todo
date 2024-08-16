import { DeleteResult, Repository } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoListDto } from './dto/todo-list.dto';
import { Todo } from './entities';
import { TodoDto } from './dto';

@Injectable()
export class TodoListRepository {
    constructor(
        @InjectRepository(TodoList)
        private readonly todoListRepository: Repository<TodoList>,
        @InjectRepository(Todo)
        private readonly todoRepository: Repository<Todo>,
    ) {}

    async saveTodoList(userId: number, todoListDto: TodoListDto): Promise<TodoList> {
        const todoList = { userId, ...todoListDto };
        return await this.todoListRepository.save(todoList);
    }

    async saveTodoListItem(todoDto: TodoDto): Promise<Todo> {
        return await this.todoRepository.save(todoDto);
    }

    async findTodoLists(userId: number): Promise<TodoList[]> {
        return await this.todoListRepository.find({
            where: { userId },
            relations: ['todos'],
        });
    }

    async findTodoList(id: number): Promise<TodoList | null> {
        return await this.todoListRepository.findOneOrFail({
            where: { id },
            relations: ['todos'],
        });
    }

    async deleteTodoList(id: number): Promise<DeleteResult> {
        return await this.todoListRepository.delete(id);
    }

    async deleteTodoListItem(id: number): Promise<DeleteResult> {
        return await this.todoRepository.delete(id);
    }
}
