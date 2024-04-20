import { Module } from '@nestjs/common';
import { TodolistService } from './todolist.service';
import { TodolistController } from './todolist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodolistRepository } from './todolist.repository';
import { TodoList } from './entities/todolist.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList])],
    controllers: [TodolistController],
    providers: [TodolistService, TodolistRepository],
})
export class TodolistModule {}
