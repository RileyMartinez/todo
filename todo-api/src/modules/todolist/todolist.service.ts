import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodolistDto } from './dto/create-todolist.dto';
import { UpdateTodolistDto } from './dto/update-todolist.dto';
import { TodolistRepository } from './todolist.repository';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { ExceptionConstants } from 'src/common/constants';

@Injectable()
export class TodolistService {
    constructor(private readonly todolistRepository: TodolistRepository) {}

    async create(createTodolistDto: CreateTodolistDto): Promise<InsertResult> {
        return await this.todolistRepository.upsert(createTodolistDto);
    }

    async findAll(userId: number): Promise<TodoList[]> {
        if (userId < 1) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const todoLists = await this.todolistRepository.getMany(userId);

        if (!todoLists || todoLists.length === 0) {
            throw new NotFoundException('No todo lists found');
        }

        return todoLists;
    }

    async findOne(id: number): Promise<TodoList | null> {
        const todoList = await this.todolistRepository.getOne(id);

        if (!todoList) {
            throw new NotFoundException(`Todo list with id ${id} not found`);
        }

        return todoList;
    }

    async update(id: number, updateTodolistDto: UpdateTodolistDto): Promise<UpdateResult> {
        return await this.todolistRepository.update(id, updateTodolistDto);
    }

    async remove(id: number): Promise<DeleteResult> {
        return await this.todolistRepository.delete(id);
    }
}
