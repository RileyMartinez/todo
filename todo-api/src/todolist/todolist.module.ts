import { Module } from '@nestjs/common';
import { TodolistService } from './todolist.service';
import { TodolistController } from './todolist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodolistRepository } from './todolist.repository';

@Module({
    controllers: [TodolistController],
    imports: [TypeOrmModule.forFeature([TodolistRepository])],
    providers: [TodolistService],
})
export class TodolistModule {}
