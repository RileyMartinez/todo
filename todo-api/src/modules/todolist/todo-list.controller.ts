import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { TodoListDto } from './dto/todo-list.dto';
import { DeleteResult } from 'typeorm';
import { TodoList } from './entities/todolist.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ExceptionConstants } from 'src/common/constants';

@Controller('todo-list')
@ApiTags('todo-list')
@ApiBearerAuth()
@SkipThrottle()
export class TodoListController {
    constructor(private readonly todolistService: TodoListService) {}

    /**
     * Create a new todo list, or update an existing one.
     */
    @Post()
    @ApiOkResponse({ type: TodoList })
    async createOrUpdate(@Body() createTodolistDto: TodoListDto): Promise<TodoList> {
        return await this.todolistService.createOrUpdate(createTodolistDto);
    }

    /**
     * Get all todo lists for a given user.
     */
    @Get('user/:id')
    @ApiOkResponse({ type: [TodoList] })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: 'No Todo lists found' })
    async findAll(@Param('id', ParseIntPipe) userId: number): Promise<TodoList[]> {
        return await this.todolistService.find(userId);
    }

    /**
     * Get a todo list by its ID.
     */
    @Get(':id')
    @ApiOkResponse({ type: TodoList })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_LIST_ID })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<TodoList | null> {
        return await this.todolistService.findOne(id);
    }

    /**
     * Remove a todo list by its ID.
     */
    @Delete(':id')
    @ApiOkResponse({ type: DeleteResult })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todolistService.remove(id);
    }
}
