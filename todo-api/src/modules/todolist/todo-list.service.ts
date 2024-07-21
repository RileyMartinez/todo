import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TodoListDto } from './dto/todo-list.dto';
import { TodoListRepository } from './todo-list.repository';
import { DeleteResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { ExceptionConstants } from 'src/common/constants';

@Injectable()
export class TodoListService {
    constructor(private readonly todolistRepository: TodoListRepository) {}

    async createOrUpdate(createTodolistDto: TodoListDto): Promise<TodoList> {
        return await this.todolistRepository.save(createTodolistDto);
    }

    async find(userId: number): Promise<TodoList[]> {
        if (userId < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const todoLists = await this.todolistRepository.find(userId);

        if (!todoLists || todoLists.length === 0) {
            throw new NotFoundException('No todo lists found');
        }

        return todoLists;
    }

    async findOne(id: number): Promise<TodoList | null> {
        if (id < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
        }

        return await this.todolistRepository.findOne(id);
    }

    async remove(id: number): Promise<DeleteResult> {
        return await this.todolistRepository.delete(id);
    }
}
