import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, of, switchMap, take } from 'rxjs';
import { TodoList, TodoListDto, TodoListService } from '../openapi-client';
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

        this.authProvider.user$
            .pipe(
                take(1),
                switchMap((user) => {
                    if (!user) {
                        return of([]);
                    }

                    return this.todoListService.todoListControllerFindAll(user.sub);
                }),
                catchError(() => of([])),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoLists) => {
                this.todoListsSubject.next(todoLists.sort((a, b) => a.id - b.id));
            });
    }

    public getTodoList(todoListId: number): void {
        if (this.todoListsSubject.value.length > 0) {
            const todoList = this.todoListsSubject.value.find((todoList) => todoList.id === todoListId) || null;
            this.todoListSubject.next(todoList);
        } else {
            this.loadingService.setLoading(true);

            this.todoListService
                .todoListControllerFindOne(todoListId)
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

        this.authProvider.user$
            .pipe(
                take(1),
                switchMap((user) => {
                    if (!user) {
                        return of(null);
                    }

                    const createTodolistDto: TodoListDto = {
                        title,
                        userId: user.sub,
                    };

                    return this.todoListService.todoListControllerCreateOrUpdate(createTodolistDto);
                }),
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoList) => {
                if (todoList) {
                    this.todoListsSubject.next([...this.todoListsSubject.value, todoList]);
                }
            });
    }

    public deleteTodoList(todoListId: number): void {
        this.loadingService.setLoading(true);

        this.todoListService
            .todoListControllerRemove(todoListId)
            .pipe(
                catchError(() => of(null)),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe(() => {
                this.todoListsSubject.next(
                    this.todoListsSubject.value.filter((todoList) => todoList.id !== todoListId),
                );
            });
    }
}
