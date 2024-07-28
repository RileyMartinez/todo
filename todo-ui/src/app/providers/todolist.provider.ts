import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, shareReplay } from 'rxjs';
import { TodoDto, TodoList, TodoListDto, TodoListService } from '../openapi-client';
import { LoadingService } from '../services/loading.service';

@Injectable({
    providedIn: 'root',
})
export class TodoListProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodoListService);

    private $todoLists = signal<TodoList[]>([]);
    private $todoList = signal<TodoList | undefined>(undefined);

    public readonly todoLists = computed(() => this.$todoLists());
    public readonly todoList = computed(() => this.$todoList());

    public getTodoLists(): void {
        this.loadingService.setLoading(true);

        this.todoListService
            .todoListControllerFindTodoLists()
            .pipe(
                shareReplay(1),
                catchError(() => of([])),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoLists) => {
                this.$todoLists.set(todoLists);
            });
    }

    public getTodoList(id: number): void {
        this.loadingService.setLoading(true);

        this.todoListService
            .todoListControllerFindTodoList(id)
            .pipe(
                shareReplay(1),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoList) => {
                if (todoList) {
                    this.$todoList.set(todoList);
                }
            });
    }

    public createTodoList(title: string): void {
        this.loadingService.setLoading(true);

        const todoListDto: TodoListDto = {
            title,
        };

        this.todoListService
            .todoListControllerSaveTodoList(todoListDto)
            .pipe(
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoList) => {
                if (todoList) {
                    this.$todoLists.update((todoLists) => [...todoLists, todoList]);
                }
            });
    }

    public createTodoListItem(id: number, title: string): void {
        this.loadingService.setLoading(true);

        const todoDto: TodoDto = {
            title,
            completed: false,
            order: 1,
            todoListId: id,
        };

        this.todoListService
            .todoListControllerSaveTodoListItem(todoDto)
            .pipe(
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoItem) => {
                if (todoItem) {
                    this.$todoList.update((todoList) => {
                        if (todoList) {
                            todoList.todos = [...todoList.todos, todoItem];
                        }
                        return todoList;
                    });
                }
            });
    }

    public deleteTodoList(id: number): void {
        this.loadingService.setLoading(true);

        this.todoListService
            .todoListControllerRemoveTodoList(id)
            .pipe(
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe(() => {
                this.$todoLists.update((todoLists) => todoLists.filter((todoList) => todoList.id !== id));
            });
    }

    public deleteTodoListItem(id: number): void {
        this.loadingService.setLoading(true);

        this.todoListService
            .todoListControllerRemoveTodoListItem(id)
            .pipe(
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe(() => {
                this.$todoList.update((todoList) => {
                    if (todoList) {
                        todoList.todos = todoList.todos.filter((todoItem) => todoItem.id !== id);
                    }
                    return todoList;
                });
            });
    }
}
