import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './entities/todo-list.entity';
import { Todo } from './entities/todo.entity';
import { TodoListController } from './todo-list.controller';
import { TodoListService } from './todo-list.service';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList]), TypeOrmModule.forFeature([Todo])],
    controllers: [TodoListController],
    providers: [TodoListService],
})
export class TodoListModule {}
