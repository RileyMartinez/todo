import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';
import { LoadingService } from '../../core/services/loading.service';
import { TodoList, TodoListClient } from '../../shared/openapi-client';

export interface SearchState {
    results: TodoList[];
    loaded: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    private readonly loadingService = inject(LoadingService);
    private readonly todoListClient = inject(TodoListClient);

    // state
    private readonly state = signal<SearchState>({
        results: [],
        loaded: true,
        error: null,
    });

    // selectors
    public readonly results = computed(() => this.state().results);
    public readonly loaded = computed(() => this.state().loaded);
    public readonly error = computed(() => this.state().error);

    // sources
    public readonly search$ = new Subject<string>();
    public readonly clearResults$ = new Subject<void>();

    constructor() {
        this.search$
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap((searchTerm) =>
                    this.todoListClient
                        .todoListControllerSearchTodoLists(searchTerm)
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((results) => {
                this.state.update(() => ({
                    results,
                    loaded: true,
                    error: null,
                }));
            });

        this.clearResults$
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, results: [] }))),
                takeUntilDestroyed(),
            )
            .subscribe();

        effect(() => this.loadingService.setLoading(!this.loaded()));
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error, loaded: true }));
        return EMPTY;
    }
}
