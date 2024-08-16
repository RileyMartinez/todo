import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { DeleteResult } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DecoratorConstants, ExceptionConstants } from 'src/common/constants';
import { GetCurrentUser } from 'src/common/decorators';
import { Todo, TodoList } from './entities';
import { TodoDto, TodoListDto } from './dto';

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
    async saveTodoList(
        @GetCurrentUser(DecoratorConstants.SUB, ParseIntPipe) userId: number,
        @Body() todoListDto: TodoListDto,
    ): Promise<TodoList> {
        return await this.todolistService.saveTodoList(userId, todoListDto);
    }

    /**
     * Create a new todo list item, or update an existing one.
     */
    @Post('item')
    @ApiOkResponse({ type: Todo })
    async saveTodoListItem(@Body() todoDto: TodoDto): Promise<Todo> {
        return await this.todolistService.saveTodoListItem(todoDto);
    }

    /**
     * Get all todo lists for a given user.
     */
    @Get()
    @ApiOkResponse({ type: [TodoList] })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiNotFoundResponse({ description: 'No Todo lists found' })
    async findTodoLists(@GetCurrentUser(DecoratorConstants.SUB, ParseIntPipe) userId: number): Promise<TodoList[]> {
        return await this.todolistService.findTodoLists(userId);
    }

    /**
     * Get a todo list by its ID.
     */
    @Get(':id')
    @ApiOkResponse({ type: TodoList })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_LIST_ID })
    async findTodoList(@Param('id', ParseIntPipe) id: number): Promise<TodoList | null> {
        return await this.todolistService.findTodoList(id);
    }

    /**
     * Remove a todo list by its ID.
     */
    @Delete(':id')
    @ApiOkResponse({ type: DeleteResult })
    async removeTodoList(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todolistService.deleteTodoList(id);
    }

    /**
     * Remove a todo list item by its ID.
     */
    @Delete('item/:id')
    @ApiOkResponse({ type: DeleteResult })
    async removeTodoListItem(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
        return await this.todolistService.deleteTodoListItem(id);
    }
}
