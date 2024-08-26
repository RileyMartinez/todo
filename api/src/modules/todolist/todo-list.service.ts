import { BadRequestException, Inject, Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { TodoList } from './entities/todo-list.entity';
import { ExceptionConstants } from 'src/common/constants';
import { TodoDto, TodoListDto } from './dto';
import { Todo } from './entities';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationService } from 'src/common/services/validaton.service';
import { formatLogMessage } from '@/common/utils/logger.util';

@Injectable()
export class TodoListService {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        @InjectRepository(TodoList) private readonly todolistRepository: Repository<TodoList>,
        @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
        private readonly validationService: ValidationService,
    ) {
        this.logger = logger;
        this.todolistRepository = todolistRepository;
        this.todoRepository = todoRepository;
        this.validationService = validationService;
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
        await this.validationService.validateObject(todoListDto);

        if (!userId) {
            this.logger.error(
                formatLogMessage('TLSSTLis001', ExceptionConstants.INVALID_USER_ID, { userId }),
                TodoListService.name,
            );
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
        await this.validationService.validateObject(todoDto);
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
            this.logger.error(
                formatLogMessage('TLSFTLis001', ExceptionConstants.INVALID_USER_ID, { userId }),
                TodoListService.name,
            );
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
     * @param id - The ID of the todo list.
     * @returns A promise that resolves to the found todo list, or null if not found.
     * @throws {BadRequestException} If the provided ID is invalid.
     */
    async findTodoList(id: string): Promise<TodoList | null> {
        if (!id) {
            this.logger.error(
                formatLogMessage('TLSFTLis002', ExceptionConstants.INVALID_TODO_LIST_ID, { todoListId: id }),
                TodoListService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
        }

        return await this.todolistRepository.findOneOrFail({
            where: { id },
            relations: ['todos'],
        });
    }

    /**
     * Deletes a todo list by its ID.
     *
     * @param id - The ID of the todo list to delete.
     * @returns A promise that resolves to a DeleteResult object.
     * @throws {BadRequestException} If the provided ID is invalid.
     * @throws {NotFoundException} If the todo list with the given ID is not found.
     */
    async deleteTodoList(id: string): Promise<DeleteResult> {
        if (!id) {
            this.logger.error(
                formatLogMessage('TLSDTLis001', ExceptionConstants.INVALID_TODO_LIST_ID, { todoListId: id }),
                TodoListService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_LIST_ID);
        }

        const result = await this.todolistRepository.delete(id);

        if (!result.affected) {
            this.logger.error(
                'TLSDTLis002',
                ExceptionConstants.TODO_LIST_NOT_FOUND,
                { todoListid: id },
                TodoListService.name,
            );
            throw new NotFoundException(ExceptionConstants.TODO_LIST_NOT_FOUND);
        }

        return result;
    }

    /**
     * Deletes a todo list item by its ID.
     *
     * @param id - The ID of the todo list item to delete.
     * @returns A promise that resolves to a DeleteResult object.
     * @throws {BadRequestException} If the provided ID is invalid.
     * @throws {NotFoundException} If the todo item with the given ID is not found.
     */
    async deleteTodoListItem(id: string): Promise<DeleteResult> {
        if (!id) {
            this.logger.error(
                formatLogMessage('TLSDTLIte001', ExceptionConstants.INVALID_TODO_ITEM_ID, { todoItemId: id }),
                TodoListService.name,
            );
            throw new BadRequestException(ExceptionConstants.INVALID_TODO_ITEM_ID);
        }

        const result = await this.todoRepository.delete(id);

        if (!result.affected) {
            this.logger.error(
                formatLogMessage('TLSDTLIte001', ExceptionConstants.TODO_ITEM_NOT_FOUND, { todoItemId: id }),
                TodoListService.name,
            );
            throw new NotFoundException(ExceptionConstants.TODO_ITEM_NOT_FOUND);
        }

        return result;
    }
}
