import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TodolistService } from './todolist.service';
import { CreateTodolistDto } from './dto/create-todolist.dto';
import { UpdateTodolistDto } from './dto/update-todolist.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('todolist')
@ApiTags('todolist')
@ApiBearerAuth()
@SkipThrottle()
export class TodolistController {
    constructor(private readonly todolistService: TodolistService) {}

    /**
     * Create a new todo list.
     * @param createTodolistDto - The data for creating a new todo list.
     * @returns A promise that resolves to the result of the insert operation.
     */
    @Post()
    async create(@Body() createTodolistDto: CreateTodolistDto): Promise<InsertResult> {
        return await this.todolistService.create(createTodolistDto);
    }

    /**
     * Get all todo lists.
     * @param userId - The ID of the user to get todo lists for.
     * @returns A promise that resolves to an array of todo lists.
     */
    @Get(':userId')
    async findAll(@Param('userId', ParseIntPipe) userId: number): Promise<TodoList[]> {
        return await this.todolistService.findAll(userId);
    }

    /**
     * Get a todo list by its ID.
     * @param id - The ID of the todo list.
     * @returns A promise that resolves to the found todo list or null if not found.
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<TodoList | null> {
        return await this.todolistService.findOne(id);
    }

    /**
     * Update a todo list by its ID.
     * @param id - The ID of the todo list to update.
     * @param updateTodolistDto - The data for updating the todo list.
     * @returns A promise that resolves to the result of the update operation.
     */
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTodolistDto: UpdateTodolistDto,
    ): Promise<UpdateResult> {
        return await this.todolistService.update(id, updateTodolistDto);
    }

    /**
     * Remove a todo list by its ID.
     * @param id - The ID of the todo list to remove.
     * @returns A promise that resolves to the result of the delete operation.
     */
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todolistService.remove(id);
    }
}
