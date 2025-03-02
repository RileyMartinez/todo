import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, EMPTY, merge, mergeMap, Observable, Subject, switchMap, tap } from 'rxjs';
import { AddTodoList, RemoveTodoList } from '../../../core/models/todo-list.model';
import { LoadingService } from '../../../core/services/loading.service';
import { TodoListClient } from '../../../shared/openapi-client/api/todo-list.client';
import { TodoList } from '../../../shared/openapi-client/model/todo-list';

export interface TodoListsState {
    todoLists: TodoList[];
    loaded: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class TodoListsService {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListClient = inject(TodoListClient);

    // state
    private readonly state = signal<TodoListsState>({
        todoLists: [],
        loaded: false,
        error: null,
    });

    // selectors
    public readonly todoLists = computed(() => this.state().todoLists);
    public readonly loaded = computed(() => this.state().loaded);
    public readonly error = computed(() => this.state().error);

    // sources
    public readonly load$ = new Subject<void>();
    public readonly add$ = new Subject<AddTodoList>();
    public readonly remove$ = new Subject<RemoveTodoList>();

    private readonly todoListAdded$ = this.add$.pipe(
        concatMap((todoList) =>
            this.todoListClient
                .todoListControllerSaveTodoList(todoList)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    private readonly todoListRemoved$ = this.remove$.pipe(
        mergeMap((todoList) =>
            this.todoListClient
                .todoListControllerRemoveTodoList(todoList.id)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    constructor() {
        // reducers
        merge(this.load$, this.todoListAdded$, this.todoListRemoved$)
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap(() =>
                    this.todoListClient
                        .todoListControllerFindTodoLists()
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((todoLists) =>
                this.state.update((state) => ({
                    ...state,
                    todoLists,
                    loaded: true,
                })),
            );

        effect(() => this.loadingService.setLoading(!this.loaded()));
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        return EMPTY;
    }
}
