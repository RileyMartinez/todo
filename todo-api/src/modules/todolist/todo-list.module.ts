import { Module } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { TodoListController } from './todo-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoListRepository } from './todo-list.repository';
import { TodoList } from './entities/todolist.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList])],
    controllers: [TodoListController],
    providers: [TodoListService, TodoListRepository],
})
export class TodoListModule {}
