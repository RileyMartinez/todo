import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, concatMap, EMPTY, merge, mergeMap, Observable, Subject, switchMap, tap } from 'rxjs';
import { TodoList, TodoListService } from '../openapi-client';
import { LoadingService } from '../services/loading.service';
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
export class TodoListProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodoListService);

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

    private readonly todoListLoaded$ = this.load$.pipe(
        switchMap((todoList) =>
            this.todoListService
                .todoListControllerFindTodoList(todoList.id)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    private readonly todoAdded$ = this.add$.pipe(
        concatMap((todo) =>
            this.todoListService
                .todoListControllerSaveTodoListItem(todo)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    private readonly todoRemoved$ = this.remove$.pipe(
        mergeMap((todo) =>
            this.todoListService
                .todoListControllerRemoveTodoListItem(todo.id)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    constructor() {
        // reducers
        this.todoListLoaded$
            .pipe(takeUntilDestroyed())
            .subscribe((todoList) => this.state.update((state) => ({ ...state, todoList, loaded: true })));

        merge(this.todoAdded$, this.todoRemoved$)
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap(() =>
                    this.todoListService
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
