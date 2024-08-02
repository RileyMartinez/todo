import { catchError, concatMap, EMPTY, merge, mergeMap, Observable, startWith, Subject, switchMap } from 'rxjs';
import { TodoList, TodoListService } from '../openapi-client';
import { computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingService } from '../services/loading.service';
import { AddTodoList, RemoveTodoList } from '../interfaces/todo-list.interface';

export interface TodoListsState {
    todoLists: TodoList[];
    loaded: boolean;
    error: string | null;
}

export class TodoListsProvider {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListService = inject(TodoListService);

    private state = signal<TodoListsState>({
        todoLists: [],
        loaded: false,
        error: null,
    });

    todoLists = computed(() => this.state().todoLists);
    loaded = computed(() => this.state().loaded);
    error = computed(() => this.state().error);

    add$ = new Subject<AddTodoList>();
    remove$ = new Subject<RemoveTodoList>();

    private readonly todoListAdded$ = this.add$.pipe(
        concatMap((addTodoList) =>
            this.todoListService
                .todoListControllerSaveTodoList(addTodoList)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    private readonly todoListRemoved$ = this.remove$.pipe(
        mergeMap((removeTodoList) =>
            this.todoListService
                .todoListControllerRemoveTodoList(removeTodoList.id)
                .pipe(catchError((error) => this.handleError(error))),
        ),
    );

    constructor() {
        // reducers
        merge(this.todoListAdded$, this.todoListRemoved$)
            .pipe(
                startWith(null),
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

        effect(() => this.loadingService.setLoading(!this.loaded()));
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        return EMPTY;
    }
}
