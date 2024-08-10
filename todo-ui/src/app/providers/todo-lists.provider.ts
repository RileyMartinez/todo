import { catchError, concatMap, EMPTY, merge, mergeMap, Observable, startWith, Subject, switchMap, tap } from 'rxjs';
import { TodoList, TodoListService } from '../openapi-client';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from '../services/loading.service';
import { AddTodoList, RemoveTodoList } from '../interfaces/todo-list.interface';

export interface TodoListsState {
    todoLists: TodoList[];
    loaded: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class TodoListsProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodoListService);

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
    public readonly add$ = new Subject<AddTodoList>();
    public readonly remove$ = new Subject<RemoveTodoList>();

    private readonly todoListAdded$ = this.add$.pipe(
        concatMap((todoList) =>
            this.todoListService
                .todoListControllerSaveTodoList(todoList)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    private readonly todoListRemoved$ = this.remove$.pipe(
        mergeMap((todoList) =>
            this.todoListService
                .todoListControllerRemoveTodoList(todoList.id)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    constructor() {
        // reducers
        merge(this.todoListAdded$, this.todoListRemoved$)
            .pipe(
                startWith(null),
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap(() =>
                    this.todoListService
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

        effect(() => this.loadingService.setLoading(!this.loaded()), { allowSignalWrites: true });
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        return EMPTY;
    }
}
