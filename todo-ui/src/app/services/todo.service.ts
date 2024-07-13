import { Injectable } from '@angular/core';
import { catchError, finalize, Observable, of } from 'rxjs';
import { CreateTodolistDto, TodoList, TodolistService } from '../openapi-client';
import { LoadingService } from './loading.service';
import { User } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root',
})
export class TodoService {
    constructor(
        private loadingService: LoadingService,
        private todoListService: TodolistService,
    ) {}

    public getTodoLists(user: User | null): Observable<TodoList[]> {
        if (!user) {
            return of([]);
        }

        this.loadingService.setLoading(true);

        return this.todoListService.todolistControllerFindAll(user.sub).pipe(
            catchError((error) => {
                console.error(error);
                return of([]);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    public createTodoList(user: User | null, title: string): Observable<TodoList | null> {
        if (!user) {
            return of(null);
        }

        this.loadingService.setLoading(true);
        const createTodolistDto: CreateTodolistDto = {
            title,
            userId: user.sub,
        };

        return this.todoListService.todolistControllerCreate(createTodolistDto).pipe(
            catchError((error) => {
                console.error(error);
                return of(null);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }
}
