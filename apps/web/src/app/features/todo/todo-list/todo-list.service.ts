import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, delay, EMPTY, mergeMap, Observable, Subject, switchMap } from 'rxjs';
import { GetTodoList } from '../../../core/models/todo-list.model';
import { AddTodo, RemoveTodo } from '../../../core/models/todo.model';
import { LoadingService } from '../../../core/services/loading.service';
import { TodoListClient } from '../../../shared/openapi-client/api/todo-list.client';
import { TodoList } from '../../../shared/openapi-client/model/todo-list';

export interface TodoListState {
    todoList: TodoList | undefined;
    loaded: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class TodoListService {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListClient = inject(TodoListClient);

    // state
    private readonly state = signal<TodoListState>({
        todoList: undefined,
        loaded: false,
        error: null,
    });

    // selectors
    public readonly todoList = computed(() => this.state().todoList);
    public readonly loaded = computed(() => this.state().loaded);
    public readonly error = computed(() => this.state().error);

    // sources
    public readonly load$ = new Subject<GetTodoList>();
    public readonly add$ = new Subject<AddTodo>();
    public readonly remove$ = new Subject<RemoveTodo>();

    private readonly todoAdded$ = this.add$.pipe(
        concatMap((todo) =>
            this.todoListClient
                .todoListControllerSaveTodoListItem(todo)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    private readonly todoRemoved$ = this.remove$.pipe(
        mergeMap((todo) =>
            this.todoListClient
                .todoListControllerRemoveTodoListItem(todo.id)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    constructor() {
        // reducers
        this.load$
            .pipe(
                switchMap((todoList) =>
                    this.todoListClient
                        .todoListControllerFindTodoList(todoList.id)
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((todoList) => this.state.update((state) => ({ ...state, todoList, loaded: true })));

        this.todoAdded$
            .pipe(
                switchMap(() =>
                    this.todoListClient
                        .todoListControllerFindTodoList(this.todoList()?.id || '')
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((todoList) => {
                this.state.update((state) => ({ ...state, todoList }));
            });

        this.todoRemoved$
            .pipe(
                switchMap(() =>
                    this.todoListClient.todoListControllerFindTodoList(this.todoList()?.id || '').pipe(
                        // Delay to allow the UI to animate todo item completion state
                        delay(250),
                        catchError((error) => this.handleError(error)),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((todoList) => {
                this.state.update((state) => ({ ...state, todoList }));
            });

        effect(() => this.loadingService.setLoading(!this.loaded()), { allowSignalWrites: true });
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        return EMPTY;
    }
}
