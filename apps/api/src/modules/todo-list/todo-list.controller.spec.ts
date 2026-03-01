import { Test, TestingModule } from '@nestjs/testing';
import { TodoListController } from '@/modules/todo-list/todo-list.controller';
import { TodoListService } from '@/modules/todo-list/todo-list.service';

describe('TodoListController', () => {
    let controller: TodoListController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TodoListController],
            providers: [TodoListService],
        }).compile();

        controller = module.get<TodoListController>(TodoListController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
