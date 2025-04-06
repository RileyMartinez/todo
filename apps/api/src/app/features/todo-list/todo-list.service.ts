import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validateOrReject } from 'class-validator';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { TodoListDto } from './dto/todo-list.dto';
import { TodoListsDto } from './dto/todo-lists.dto';
import { TodoSearchDto } from './dto/todo-search.dto';
import { TodoDto } from './dto/todo.dto';
import { TodoList } from './entities/todo-list.entity';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoListService {
    private readonly logger = new Logger(TodoListService.name);

    constructor(
        @InjectRepository(TodoList) private readonly todolistRepository: Repository<TodoList>,
        @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    ) {}

    /**
     * Saves a todo list for a specific user.
     *
     * @param userId - The ID of the user.
     * @param todoListDto - The todo list to be saved.
     * @returns A promise that resolves to the saved todo list.
     * @throws {BadRequestException} If the user ID is invalid.
     */
    async saveTodoList(userId: string, todoListDto: TodoListDto): Promise<TodoList> {
        await validateOrReject(todoListDto);

        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.todolistRepository.save({ userId, ...todoListDto });
    }

    /**
     * Saves a todo list item.
     *
     * @param todoDto - The todo item to be saved.
     * @returns A promise that resolves to the saved todo item.
     */
    async saveTodoListItem(todoDto: TodoDto): Promise<Todo> {
        await validateOrReject(todoDto);
        return await this.todoRepository.save(todoDto);
    }

    /**
     * Batch updates the positions of todo lists.
     *
     * @param userId - The ID of the user.
     * @param todoListsDto - The todo lists to update.
     */
    async updateTodoListPositions(userId: string, todoListsDto: TodoListsDto): Promise<void> {
        await validateOrReject(todoListsDto);
        const { todoLists } = todoListsDto;

        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const updates: Promise<UpdateResult>[] = todoLists.map((todoList, index) => {
            if (!todoList.id) {
                this.logger.error({ todoList }, ExceptionConstants.INVALID_TODO_LIST_ID);
                throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
            }

            return this.todolistRepository.update(todoList.id, {
                order: index,
            });
        });

        await Promise.all(updates);
    }

    /**
     * Batch updates the positions of todo list items.
     *
     * @param userId - The ID of the user.
     * @param todoList - The todo list containing the items to update.
     */
    async updateTodoListItemPositions(userId: string, todoList: TodoList): Promise<void> {
        if (!userId || userId !== todoList?.userId) {
            this.logger.error(
                { userId, todoListUserId: todoList.userId },
                'Invalid user ID or todo list user ID mismatch',
            );
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        if (!todoList) {
            const errorMessage = 'Todo list is required';
            this.logger.error({ userId }, errorMessage);
            throw new BadRequestException(errorMessage);
        }

        if (!todoList.todos || todoList.todos.length === 0) {
            const errorMessage = 'Todo items are required';
            this.logger.error({ todoList }, errorMessage);
            throw new BadRequestException(errorMessage);
        }

        const updates: Promise<UpdateResult>[] = todoList.todos.map((item, index) => {
            if (!item.id) {
                this.logger.error({ item }, ExceptionConstants.INVALID_TODO_ITEM_ID);
                throw new BadRequestException(ExceptionConstants.INVALID_TODO_ITEM_ID);
            }

            return this.todoRepository.update(item.id, {
                order: index,
            });
        });

        await Promise.all(updates);
    }

    /**
     * Retrieves the todo lists for a given user.
     *
     * @param userId - The ID of the user.
     * @returns A promise that resolves to an array of TodoList objects.
     * @throws {BadRequestException} If the userId is invalid.
     */
    async findTodoLists(userId: string): Promise<TodoList[]> {
        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        return await this.todolistRepository.find({
            where: { userId },
            relations: ['todos'],
        });
    }

    /**
     * Retrieves todo lists for a given user based on a search term.
     *
     * @param userId - The ID of the user.
     * @param term - The search term to filter todo lists.
     * @param page - The page number for pagination.
     * @param limit - The number of items per page.
     * @returns A promise that resolves to an array of TodoList objects matching the search term.
     * @throws {BadRequestException} If the userId is invalid.
     */
    async searchTodoLists(userId: string, todoSearchDto: TodoSearchDto): Promise<TodoList[]> {
        validateOrReject(todoSearchDto);

        if (!userId) {
            this.logger.error({ userId }, ExceptionConstants.INVALID_USER_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_USER_ID);
        }

        const { term, page, limit } = todoSearchDto;
        const skip = (page - 1) * limit;

        const queryBuilder = this.todolistRepository
            .createQueryBuilder('todoList')
            .leftJoinAndSelect('todoList.todos', 'todo')
            .where('todoList.userId = :userId', { userId })
            .andWhere(
                `(
                todoList.title ILIKE :searchTerm
                OR todo.title ILIKE :searchTerm 
                OR todo.description ILIKE :searchTerm
            )`,
                {
                    searchTerm: `%${term}%`,
                },
            )
            .take(limit)
            .skip(skip);

        return await queryBuilder.getMany();
    }

    /**
     * Finds a todo list by its ID.
     *
     * @param todoListId - The ID of the todo list.
     * @returns A promise that resolves to the found todo list, or null if not found.
     * @throws {BadRequestException} If the provided ID is invalid.
     */
    async findTodoList(todoListId: string): Promise<TodoList | null> {
        if (!todoListId) {
            this.logger.error({ todoListId }, ExceptionConstants.INVALID_TODO_LIST_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
        }

        return await this.todolistRepository.findOneOrFail({
            where: { id: todoListId },
            relations: ['todos'],
        });
    }

    /**
     * Deletes a todo list by its ID.
     *
     * @param todoListId - The ID of the todo list to delete.
     * @returns A promise that resolves to a DeleteResult object.
     * @throws {BadRequestException} If the provided ID is invalid.
     * @throws {NotFoundException} If the todo list with the given ID is not found.
     */
    async deleteTodoList(todoListId: string): Promise<DeleteResult> {
        if (!todoListId) {
            this.logger.error({ todoListId }, ExceptionConstants.INVALID_TODO_LIST_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
        }

        const result = await this.todolistRepository.delete({ id: todoListId });

        if (!result.affected) {
            this.logger.error({ todoListId }, ExceptionConstants.TODO_LIST_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.TODO_LIST_NOT_FOUND);
        }

        return result;
    }

    /**
     * Deletes a todo list item by its ID.
     *
     * @param todoId - The ID of the todo list item to delete.
     * @returns A promise that resolves to a DeleteResult object.
     * @throws {BadRequestException} If the provided ID is invalid.
     * @throws {NotFoundException} If the todo item with the given ID is not found.
     */
    async deleteTodoListItem(todoId: string): Promise<DeleteResult> {
        if (!todoId) {
            this.logger.error({ todoId }, ExceptionConstants.INVALID_TODO_ITEM_ID);
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_ITEM_ID);
        }

        const result = await this.todoRepository.delete({ id: todoId });

        if (!result.affected) {
            this.logger.error({ todoId }, ExceptionConstants.TODO_ITEM_NOT_FOUND);
            throw new NotFoundException(ExceptionConstants.TODO_ITEM_NOT_FOUND);
        }

        return result;
    }
}
