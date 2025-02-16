import { Module } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { TodoListController } from './todo-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationUtil } from '@/common/utils/validaton.util';
import { TodoList } from './entities/todo-list.entity';
import { Todo } from './entities/todo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList]), TypeOrmModule.forFeature([Todo])],
    controllers: [TodoListController],
    providers: [TodoListService, ValidationUtil],
})
export class TodoListModule {}
