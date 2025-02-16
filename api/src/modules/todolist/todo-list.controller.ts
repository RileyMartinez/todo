import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TodoListService } from './todo-list.service';
import { DeleteResult } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DecoratorConstants } from '@/common/constants/decorator.constants';
import { ExceptionConstants } from '@/common/constants/exception.constants';
import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';
import { TodoListDto } from './dto/todo-list.dto';
import { TodoDto } from './dto/todo.dto';
import { TodoList } from './entities/todo-list.entity';
import { Todo } from './entities/todo.entity';

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
}
