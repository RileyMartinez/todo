import { DecoratorConstants } from '@/app/core/constants/decorator.constants';
import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { GetCurrentUser } from '@/app/core/decorators/get-current-user.decorator';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { DeleteResult } from 'typeorm';
import { TodoListDto } from './dto/todo-list.dto';
import { TodoSearchDto } from './dto/todo-search.dto';
import { TodoDto } from './dto/todo.dto';
import { TodoList } from './entities/todo-list.entity';
import { Todo } from './entities/todo.entity';
import { TodoListService } from './todo-list.service';

@Controller('todo-list')
@ApiTags('todo-list')
@ApiCookieAuth()
@SkipThrottle()
export class TodoListController {
    constructor(private readonly todolistService: TodoListService) {}

    /**
     * Create a new todo list, or update an existing one.
     */
    @Post()
    @ApiOkResponse({ type: TodoList })
    @ApiBadRequestResponse({
        description: `${ExceptionConstants.INVALID_USER_ID} | ${ExceptionConstants.VALIDATION_FAILED}`,
    })
    async saveTodoList(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() todoListDto: TodoListDto,
    ): Promise<TodoList> {
        return await this.todolistService.saveTodoList(userId, todoListDto);
    }

    /**
     * Create a new todo list item, or update an existing one.
     */
    @Post('item')
    @ApiOkResponse({ type: Todo })
    @ApiBadRequestResponse({ description: ExceptionConstants.VALIDATION_FAILED })
    async saveTodoListItem(@Body() todoDto: TodoDto): Promise<Todo> {
        return await this.todolistService.saveTodoListItem(todoDto);
    }

    /**
     * Get all todo lists for a given user.
     */
    @Get()
    @ApiOkResponse({ type: [TodoList] })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    async findTodoLists(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<TodoList[]> {
        return await this.todolistService.findTodoLists(userId);
    }

    @Get('search')
    @ApiOkResponse({ type: [TodoList] })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiQuery({ name: 'term', required: true, description: 'Search term' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Page size', type: 'number' })
    async searchTodoLists(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Query('term') term: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<TodoList[]> {
        return await this.todolistService.searchTodoLists(userId, new TodoSearchDto(term, limit, page));
    }

    /**
     * Remove a todo list item by its ID.
     */
    @Delete('item/:id')
    @ApiOkResponse({ type: DeleteResult })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_ITEM_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.TODO_ITEM_NOT_FOUND })
    async removeTodoListItem(@Param('id') id: string): Promise<DeleteResult> {
        return await this.todolistService.deleteTodoListItem(id);
    }

    /**
     * Get a todo list by its ID.
     */
    @Get(':id')
    @ApiOkResponse({ type: TodoList })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_LIST_ID })
    async findTodoList(@Param('id') id: string): Promise<TodoList | null> {
        return await this.todolistService.findTodoList(id);
    }

    /**
     * Remove a todo list by its ID.
     */
    @Delete(':id')
    @ApiOkResponse({ type: DeleteResult })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_LIST_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.TODO_LIST_NOT_FOUND })
    async removeTodoList(@Param('id') id: string): Promise<DeleteResult> {
        return await this.todolistService.deleteTodoList(id);
    }
}
