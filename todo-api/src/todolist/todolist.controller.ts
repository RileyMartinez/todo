import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { TodolistService } from './todolist.service';
import { CreateTodolistDto } from './dto/create-todolist.dto';
import { UpdateTodolistDto } from './dto/update-todolist.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('todolist')
@UseGuards(JwtGuard)
@SkipThrottle()
export class TodolistController {
    constructor(private readonly todolistService: TodolistService) {}

    @Post()
    async create(
        @Body() createTodolistDto: CreateTodolistDto,
    ): Promise<InsertResult> {
        return await this.todolistService.create(createTodolistDto);
    }

    @Get()
    async findAll(): Promise<TodoList[]> {
        return await this.todolistService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<TodoList | null> {
        return await this.todolistService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTodolistDto: UpdateTodolistDto,
    ): Promise<UpdateResult> {
        return await this.todolistService.update(id, updateTodolistDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todolistService.remove(id);
    }
}
