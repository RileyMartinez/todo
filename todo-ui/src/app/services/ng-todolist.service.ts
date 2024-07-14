import { inject, Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { CreateTodolistDto, TodoList, TodolistService } from '../openapi-client';
import { LoadingService } from './loading.service';
import { NgAuthService } from './ng-auth.service';

@Injectable({
    providedIn: 'root',
})
export class NgTodoListService {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodolistService);
    private readonly ngAuthService = inject(NgAuthService);

    public getTodoLists(): Observable<TodoList[]> {
        this.loadingService.setLoading(true);

        return this.ngAuthService.user$.pipe(
            switchMap((user) => {
                if (!user) {
                    return of([]);
                }

                return this.todoListService.todolistControllerFindAll(user.sub);
            }),
            catchError(() => of([])),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    public createTodoList(title: string): Observable<TodoList | null> {
        this.loadingService.setLoading(true);

        return this.ngAuthService.user$.pipe(
            switchMap((user) => {
                if (!user) {
                    return of(null);
                }

                const createTodolistDto: CreateTodolistDto = {
                    title,
                    userId: user.sub,
                };

                return this.todoListService.todolistControllerCreate(createTodolistDto);
            }),
            catchError(() => of(null)),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    public deleteTodoList(todoListId: number): Observable<void> {
        this.loadingService.setLoading(true);

        return this.todoListService.todolistControllerRemove(todoListId).pipe(
            catchError(() => of(null)),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }
}
