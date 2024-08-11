import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, concatMap, EMPTY, merge, mergeMap, Observable, Subject, switchMap, tap } from 'rxjs';
import { TodoList, TodoListClient } from '../openapi-client';
import { LoadingService } from './loading.service';
import { AddTodo, RemoveTodo } from '../interfaces/todo.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GetTodoList } from '../interfaces/todo-list.interface';

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

        merge(this.todoAdded$, this.todoRemoved$)
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap(() =>
                    this.todoListClient
                        .todoListControllerFindTodoList(this.todoList()?.id || 0)
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((todoList) => {
                this.state.update((state) => ({ ...state, todoList, loaded: true }));
            });

        effect(() => this.loadingService.setLoading(!this.loaded()), { allowSignalWrites: true });
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        return EMPTY;
    }
}
