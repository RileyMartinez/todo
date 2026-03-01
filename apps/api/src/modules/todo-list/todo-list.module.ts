import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from '@/modules/todo-list/entities/todo-list.entity';
import { Todo } from '@/modules/todo-list/entities/todo.entity';
import { TodoListController } from '@/modules/todo-list/todo-list.controller';
import { TodoListService } from '@/modules/todo-list/todo-list.service';

@Module({
    imports: [TypeOrmModule.forFeature([TodoList]), TypeOrmModule.forFeature([Todo])],
    controllers: [TodoListController],
    providers: [TodoListService],
})
export class TodoListModule {}
