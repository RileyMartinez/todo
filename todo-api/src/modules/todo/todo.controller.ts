import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from 'src/modules/auth/guards/jwt-access.guard';

@Controller('todo')
@UseGuards(JwtAccessGuard)
@ApiTags('todo')
@ApiBearerAuth()
@SkipThrottle()
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    /**
     * Create a new todo.
     * @param createTodoDto - The data for creating a new todo.
     * @returns A promise that resolves to the result of the todo creation.
     */
    @Post()
    async create(@Body() createTodoDto: CreateTodoDto): Promise<InsertResult> {
        return await this.todoService.create(createTodoDto);
    }

    /**
     * Find a todo by its ID.
     * @param id - The ID of the todo to find.
     * @returns A promise that resolves to the found todo or null if not found.
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Todo | null> {
        return await this.todoService.findOne(id);
    }

    /**
     * Update a todo by its ID.
     * @param id - The ID of the todo to update.
     * @param updateTodoDto - The data for updating the todo.
     * @returns A promise that resolves to the result of the todo update.
     */
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateTodoDto: UpdateTodoDto): Promise<UpdateResult> {
        return await this.todoService.update(id, updateTodoDto);
    }

    /**
     * Remove a todo by its ID.
     * @param id - The ID of the todo to remove.
     * @returns A promise that resolves to the result of the todo removal.
     */
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todoService.remove(id);
    }
}
