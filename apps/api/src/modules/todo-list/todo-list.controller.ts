import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';
import { DeleteResultResponseDto } from '@/common/dto/delete-result-response.dto';
import { TodoListResponseDto } from '@/modules/todo-list/dto/todo-list-response.dto';
import { TodoListDto } from '@/modules/todo-list/dto/todo-list.dto';
import { TodoListsDto } from '@/modules/todo-list/dto/todo-lists.dto';
import { TodoResponseDto } from '@/modules/todo-list/dto/todo-response.dto';
import { TodoSearchDto } from '@/modules/todo-list/dto/todo-search.dto';
import { TodoDto } from '@/modules/todo-list/dto/todo.dto';
import { TodoList } from '@/modules/todo-list/entities/todo-list.entity';
import { TodoListService } from '@/modules/todo-list/todo-list.service';
import { DecoratorConstants } from '@/shared/constants/decorator.constants';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCookieAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('todo-list')
@ApiTags('todo-list')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@SkipThrottle()
export class TodoListController {
    constructor(private readonly todolistService: TodoListService) {}

    /**
     * Create a new todo list, or update an existing one.
     */
    @Post()
    @ApiOkResponse({ type: TodoListResponseDto })
    @ApiBadRequestResponse({
        description: `${ExceptionConstants.INVALID_USER_ID} | ${ExceptionConstants.VALIDATION_FAILED}`,
    })
    async saveTodoList(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() todoListDto: TodoListDto,
    ): Promise<TodoListResponseDto> {
        const todoList = await this.todolistService.saveTodoList(userId, todoListDto);
        return todoList.toResponseDto();
    }

    /**
     * Create a new todo list item, or update an existing one.
     */
    @Post('item')
    @ApiOkResponse({ type: TodoResponseDto })
    @ApiBadRequestResponse({ description: ExceptionConstants.VALIDATION_FAILED })
    async saveTodoListItem(@Body() todoDto: TodoDto): Promise<TodoResponseDto> {
        const todo = await this.todolistService.saveTodoListItem(todoDto);
        return todo.toResponseDto();
    }

    @Post('item/position')
    @ApiOkResponse({ description: 'Todo list item positions updated successfully' })
    @ApiBadRequestResponse({ description: ExceptionConstants.VALIDATION_FAILED })
    @HttpCode(HttpStatus.OK)
    async updateTodoListItemPositions(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() todoList: TodoList,
    ): Promise<void> {
        await this.todolistService.updateTodoListItemPositions(userId, todoList);
    }

    @Post('list/position')
    @ApiOkResponse({ description: 'Todo list positions updated successfully' })
    @ApiBadRequestResponse({ description: ExceptionConstants.VALIDATION_FAILED })
    @HttpCode(HttpStatus.OK)
    async updateTodoListPositions(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Body() todoListsDto: TodoListsDto,
    ): Promise<void> {
        await this.todolistService.updateTodoListPositions(userId, todoListsDto);
    }

    /**
     * Get all todo lists for a given user.
     */
    @Get()
    @ApiOkResponse({ type: [TodoListResponseDto] })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    async findTodoLists(@GetCurrentUser(DecoratorConstants.SUB) userId: string): Promise<TodoListResponseDto[]> {
        const lists = await this.todolistService.findTodoLists(userId);
        return lists.map((list) => list.toResponseDto());
    }

    @Get('search')
    @ApiOkResponse({ type: [TodoListResponseDto] })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_USER_ID })
    @ApiQuery({ name: 'term', required: true, description: 'Search term' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Page size', type: 'number' })
    async searchTodoLists(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Query('term') term: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<TodoListResponseDto[]> {
        const lists = await this.todolistService.searchTodoLists(userId, new TodoSearchDto(term, limit, page));
        return lists.map((list) => list.toResponseDto());
    }

    /**
     * Remove a todo list item by its ID.
     */
    @Delete('item/:id')
    @ApiOkResponse({ type: DeleteResultResponseDto })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_ITEM_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.TODO_ITEM_NOT_FOUND })
    async removeTodoListItem(@Param('id') id: string): Promise<DeleteResultResponseDto> {
        const result = await this.todolistService.deleteTodoListItem(id);
        return new DeleteResultResponseDto(result.affected ?? 0);
    }

    /**
     * Get a todo list by its ID.
     */
    @Get(':id')
    @ApiOkResponse({ type: TodoListResponseDto })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_LIST_ID })
    async findTodoList(@Param('id') id: string): Promise<TodoListResponseDto | null> {
        const list = await this.todolistService.findTodoList(id);
        return list?.toResponseDto() ?? null;
    }

    /**
     * Remove a todo list by its ID.
     */
    @Delete(':id')
    @ApiOkResponse({ type: DeleteResultResponseDto })
    @ApiBadRequestResponse({ description: ExceptionConstants.INVALID_TODO_LIST_ID })
    @ApiNotFoundResponse({ description: ExceptionConstants.TODO_LIST_NOT_FOUND })
    async removeTodoList(@Param('id') id: string): Promise<DeleteResultResponseDto> {
        const result = await this.todolistService.deleteTodoList(id);
        return new DeleteResultResponseDto(result.affected ?? 0);
    }
}
