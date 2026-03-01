import { Test, TestingModule } from '@nestjs/testing';
import { TodoListService } from '@/modules/todo-list/todo-list.service';

describe('TodoListService', () => {
    let service: TodoListService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TodoListService],
        }).compile();

        service = module.get<TodoListService>(TodoListService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
