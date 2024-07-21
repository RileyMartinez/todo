import { DeleteResult, Repository } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoListDto } from './dto/todo-list.dto';

@Injectable()
export class TodoListRepository {
    constructor(
        @InjectRepository(TodoList)
        private readonly repository: Repository<TodoList>,
    ) {}

    async save(createTodolistDto: TodoListDto): Promise<TodoList> {
        return await this.repository.save(createTodolistDto);
    }

    async find(userId: number): Promise<TodoList[]> {
        return await this.repository.find({
            where: { userId },
            relations: ['todos'],
        });
    }

    async findOne(id: number): Promise<TodoList | null> {
        return await this.repository.findOneOrFail({
            where: { id },
            relations: ['todos'],
        });
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.repository.delete(id);
    }
}
