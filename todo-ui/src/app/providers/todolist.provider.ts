import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, first, of, switchMap, take } from 'rxjs';
import { CreateTodolistDto, TodoList, TodolistService } from '../openapi-client';
import { AuthProvider } from '../providers/auth.provider';
import { LoadingService } from '../services/loading.service';

@Injectable({
    providedIn: 'root',
})
export class TodoListProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodolistService);
    private readonly authProvider = inject(AuthProvider);

    private todoListsSubject = new BehaviorSubject<TodoList[]>([]);
    public readonly todoLists$ = this.todoListsSubject.asObservable();

    public getTodoLists(): void {
        this.loadingService.setLoading(true);

        this.authProvider.user$
            .pipe(
                take(1),
                switchMap((user) => {
                    if (!user) {
                        return of([]);
                    }

                    return this.todoListService.todolistControllerFindAll(user.sub).pipe(take(1));
                }),
                catchError(() => of([])),
                finalize(() => this.loadingService.setLoading(false)),
            )
            .subscribe((todoLists) => {
                this.todoListsSubject.next(todoLists.sort((a, b) => a.id - b.id));
            });
    }

    public getTodoList(todoListId: number): TodoList | undefined {
        return this.todoListsSubject.value.find((todoList) => todoList.id === todoListId);
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

                    const createTodolistDto: CreateTodolistDto = {
                        title,
                        userId: user.sub,
                    };

                    return this.todoListService.todolistControllerCreate(createTodolistDto).pipe(first());
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
            .todolistControllerRemove(todoListId)
            .pipe(
                take(1),
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
