import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { TodoModule } from './todo/todo.module';
import { TodolistModule } from './todolist/todolist.module';

@Module({
    imports: [TypeOrmModule.forRoot(typeOrmConfig), TodoModule, TodolistModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
