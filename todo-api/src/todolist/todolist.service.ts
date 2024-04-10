import { Injectable } from '@nestjs/common';
import { CreateTodolistDto } from './dto/create-todolist.dto';
import { UpdateTodolistDto } from './dto/update-todolist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TodolistRepository } from './todolist.repository';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class TodolistService {
    constructor(
        @InjectRepository(TodolistRepository)
        private todolistRepository: TodolistRepository,
    ) {}

    async create(createTodolistDto: CreateTodolistDto) {
        return await this.todolistRepository.save(createTodolistDto);
    }

    async findAll() {
        return await this.todolistRepository.find();
    }

    async findOne(id: number) {
        const options: FindOneOptions = {
            where: { id },
        };

        return await this.todolistRepository.findOne(options);
    }

    async update(id: number, updateTodolistDto: UpdateTodolistDto) {
        return await this.todolistRepository.update(id, updateTodolistDto);
    }

    async remove(id: number) {
        return await this.todolistRepository.delete(id);
    }
}
