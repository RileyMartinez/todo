import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoRepository } from './todo.repository';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoService {
    constructor(private readonly todoRepository: TodoRepository) {}

    async create(createTodoDto: CreateTodoDto): Promise<InsertResult> {
        return await this.todoRepository.upsert(createTodoDto);
    }

    async findOne(id: number): Promise<Todo | null> {
        const todo = await this.todoRepository.getOne(id);

        if (!todo) {
            throw new NotFoundException(`Todo with id ${id} not found`);
        }

        return todo;
    }

    async update(
        id: number,
        updateTodoDto: UpdateTodoDto,
    ): Promise<UpdateResult> {
        return await this.todoRepository.update(id, updateTodoDto);
    }

    async remove(id: number): Promise<DeleteResult> {
        return await this.todoRepository.delete(id);
    }
}
