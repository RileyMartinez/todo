import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TodoRepository {
    constructor(
        @InjectRepository(Todo)
        private readonly repository: Repository<Todo>,
    ) {}

    async upsert(createTodoDto: CreateTodoDto): Promise<InsertResult> {
        return await this.repository
            .createQueryBuilder()
            .insert()
            .into(Todo)
            .values(createTodoDto)
            .orUpdate(['title', 'description', 'completed', 'dueDate', 'order'], ['id'], {
                skipUpdateIfNoValuesChanged: true,
            })
            .execute();
    }

    async getOne(id: number): Promise<Todo | null> {
        return await this.repository.createQueryBuilder().where('id = :id', { id }).getOne();
    }

    async update(id: number, updateTodoDto: UpdateTodoDto): Promise<UpdateResult> {
        return await this.repository
            .createQueryBuilder()
            .update()
            .set(updateTodoDto)
            .where('id = :id', { id })
            .execute();
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.repository.createQueryBuilder().delete().where('id = :id', { id }).execute();
    }
}
