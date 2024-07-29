import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, first, of, shareReplay } from 'rxjs';
import { TodoDto, TodoList, TodoListDto, TodoListService } from '../openapi-client';
import { LoadingService } from '../services/loading.service';

@Injectable({
    providedIn: 'root',
})
export class TodoListProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodoListService);

    private todoListsSignal = signal<TodoList[]>([]);
    private todoListSignal = signal<TodoList | undefined>(undefined);

    public readonly todoLists = computed(() => this.todoListsSignal());
    public readonly todoList = computed(() => this.todoListSignal());

    public getTodoLists(): void {
        this.loadingService.setLoading(true);

        if (this.todoListsSignal()?.length) {
            this.loadingService.setLoading(false);
            return;
        }

        this.todoListService
            .todoListControllerFindTodoLists()
            .pipe(
                first(),
                shareReplay(1),
                catchError(() => of([])),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoLists) => {
                this.todoListsSignal.set(todoLists);
            });
    }

    public getTodoList(id: number): void {
        this.loadingService.setLoading(true);

        if (this.todoListSignal()?.id === id) {
            this.loadingService.setLoading(false);
            return;
        }

        this.todoListService
            .todoListControllerFindTodoList(id)
            .pipe(
                first(),
                shareReplay(1),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoList) => {
                if (todoList) {
                    this.todoListSignal.set(todoList);
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
                first(),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoList) => {
                if (todoList) {
                    this.todoListsSignal.update((todoLists) => [...todoLists, todoList]);
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
                first(),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoItem) => {
                if (todoItem) {
                    this.todoListSignal.update((todoList) => {
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
                first(),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe(() => {
                this.todoListsSignal.update((todoLists) => todoLists.filter((todoList) => todoList.id !== id));
            });
    }

    public deleteTodoListItem(id: number): void {
        this.loadingService.setLoading(true);

        this.todoListService
            .todoListControllerRemoveTodoListItem(id)
            .pipe(
                first(),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe(() => {
                this.todoListSignal.update((todoList) => {
                    if (todoList) {
                        todoList.todos = todoList.todos.filter((todoItem) => todoItem.id !== id);
                    }
                    return todoList;
                });
            });
    }
}
