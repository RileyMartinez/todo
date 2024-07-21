import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { TodoDto, TodoList, TodoListDto, TodoListService } from '../openapi-client';
import { AuthProvider } from '../providers/auth.provider';
import { LoadingService } from '../services/loading.service';

@Injectable({
    providedIn: 'root',
})
export class TodoListProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodoListService);
    private readonly authProvider = inject(AuthProvider);

    private todoListsSubject = new BehaviorSubject<TodoList[]>([]);
    private todoListSubject = new BehaviorSubject<TodoList | null>(null);
    public readonly todoLists$ = this.todoListsSubject.asObservable();
    public readonly todoList$ = this.todoListSubject.asObservable();

    public getTodoLists(): void {
        this.loadingService.setLoading(true);
        this.todoListService
            .todoListControllerFindTodoLists()
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoLists) => {
                this.todoListsSubject.next(todoLists.sort((a, b) => a.id - b.id));
            });
    }

    public getTodoList(id: number): void {
        if (this.todoListsSubject.value.length > 0) {
            const todoList = this.todoListsSubject.value.find((todoList) => todoList.id === id) || null;
            this.todoListSubject.next(todoList);
        } else {
            this.loadingService.setLoading(true);

            this.todoListService
                .todoListControllerFindTodoList(id)
                .pipe(
                    catchError(() => of(null)),
                    finalize(() => this.loadingService.setLoading(false)),
                )
                .subscribe((todoList) => {
                    this.todoListSubject.next(todoList);
                });
        }
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
                    this.todoListsSubject.next([...this.todoListsSubject.value, todoList]);
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
                    const todoList = this.todoListSubject.value;
                    if (todoList) {
                        todoList.todos.push(todoItem);
                        this.todoListSubject.next(todoList);
                    }
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
                this.todoListsSubject.next(this.todoListsSubject.value.filter((todoList) => todoList.id !== id));
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
                const todoList = this.todoListSubject.value;
                if (todoList) {
                    todoList.todos = todoList.todos.filter((todo) => todo.id !== id);
                    this.todoListSubject.next(todoList);
                }
            });
    }
}
