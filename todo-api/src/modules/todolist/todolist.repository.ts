import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTodolistDto } from './dto/create-todolist.dto';
import { UpdateTodolistDto } from './dto/update-todolist.dto';

@Injectable()
export class TodolistRepository {
    constructor(
        @InjectRepository(TodoList)
        private readonly repository: Repository<TodoList>,
    ) {}

    async upsert(createTodolistDto: CreateTodolistDto): Promise<TodoList> {
        return await this.repository.save(createTodolistDto);
    }

    async getMany(userId: number): Promise<TodoList[]> {
        return await this.repository
            .createQueryBuilder('todoList')
            .leftJoinAndSelect('todoList.todos', 'todos')
            .where('todoList.userId = :userId', { userId })
            .getMany();
    }

    async fineOne(id: number): Promise<TodoList | null> {
        return await this.repository.findOneOrFail({
            where: { id },
            relations: ['todos'],
        });
    }

    async update(id: number, updateTodolistDto: UpdateTodolistDto): Promise<UpdateResult> {
        return await this.repository
            .createQueryBuilder()
            .update()
            .set(updateTodolistDto)
            .where('id = :id', { id })
            .execute();
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.repository.createQueryBuilder().delete().where('id = :id', { id }).execute();
    }
}
