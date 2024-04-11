import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoRepository } from './todo.repository';
import { Todo } from './entities/todo.entity';

@Module({
    controllers: [TodoController],
    imports: [TypeOrmModule.forFeature([Todo])],
    providers: [TodoService, TodoRepository],
})
export class TodoModule {}
