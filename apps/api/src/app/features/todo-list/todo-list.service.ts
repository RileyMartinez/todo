import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validateOrReject } from 'class-validator';
import { DeleteResult, Repository } from 'typeorm';
import { TodoListDto } from './dto/todo-list.dto';
import { TodoDto } from './dto/todo.dto';
import { TodoList } from './entities/todo-list.entity';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodoListService {
    private readonly logger = new Logger(TodoListService.name);

    constructor(
        @InjectRepository(TodoList) private readonly todolistRepository: Repository<TodoList>,
        @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    ) {
        this.todolistRepository = todolistRepository;
        this.todoRepository = todoRepository;
    }

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
