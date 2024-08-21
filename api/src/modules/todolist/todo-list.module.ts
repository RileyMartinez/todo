import { Module } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { TodoListController } from './todo-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo, TodoList } from './entities';
import { ValidationService } from 'src/common/services/validaton.service';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList]), TypeOrmModule.forFeature([Todo])],
    controllers: [TodoListController],
    providers: [TodoListService, ValidationService],
})
export class TodoListModule {}
