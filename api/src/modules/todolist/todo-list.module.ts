import { Module } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { TodoListController } from './todo-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoListRepository } from './todo-list.repository';
import { Todo, TodoList } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList]), TypeOrmModule.forFeature([Todo])],
    controllers: [TodoListController],
    providers: [TodoListService, TodoListRepository],
})
export class TodoListModule {}
