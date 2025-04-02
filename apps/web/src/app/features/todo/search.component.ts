import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
    MatOption,
} from '@angular/material/autocomplete';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil, tap } from 'rxjs';
import { RouteConstants } from '../../core/constants/route.constants';
import { TodoList } from '../../shared/openapi-client';
import { SearchService } from './search.service';

@Component({
    selector: 'app-list-search',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatAutocomplete,
        MatAutocompleteTrigger,
        MatInput,
        MatLabel,
        MatOption,
        MatIcon,
        MatSuffix,
    ],
    templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
    private readonly searchService = inject(SearchService);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();
    readonly searchResults: Signal<TodoList[]> = this.searchService.results;

    searchFormControl!: FormControl;

    ngOnInit(): void {
        this.searchFormControl = new FormControl('');
        this.searchFormControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter((searchTerm) => searchTerm.length >= 3),
                tap(() => this.searchService.search$.next(this.searchFormControl.value)),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    displayFn(todoList: TodoList): string {
        return todoList ? todoList.title : '';
    }

    async onOptionSelected(event: MatAutocompleteSelectedEvent): Promise<void> {
        const todoList: TodoList = event.option.value;

        if (todoList && todoList.id) {
            const urlTree = this.router.createUrlTree([RouteConstants.TODO, RouteConstants.LIST, todoList.id]);

            // Trick to force router navigation when there's only a parameter change
            // Needed if the user searches for a list when already on another list page
            await this.router.navigateByUrl('/', { skipLocationChange: true });
            await this.router.navigateByUrl(urlTree);

            this.searchFormControl.reset(null, { emitEvent: false });
            this.searchService.clearResults$.next();
            this.searchService.onResultSelected$.next();
        }
    }

    onBlur(): void {
        this.searchFormControl.reset(null, { emitEvent: false });
        this.searchService.clearResults$.next();
    }
}
