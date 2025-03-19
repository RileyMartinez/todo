import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RouteConstants } from '../../../core/constants/route.constants';
import { TodoList } from '../../../shared/openapi-client';
import { TodoListCreateDialog } from './todo-list-create.dialog';
import { TodoListDeleteDialog } from './todo-list-delete.dialog';
import { TodoListsService } from './todo-lists.service';

@Component({
    selector: 'app-todo-lists',
    standalone: true,
    imports: [CommonModule, MatCard, MatCardContent, MatIconButton, MatIcon, MatFabButton, MatDivider],
    templateUrl: './todo-lists.component.html',
})
export class TodoListsComponent implements OnInit, OnDestroy {
    private readonly todoListsService = inject(TodoListsService);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly destroy$ = new Subject<void>();

    todoLists = this.todoListsService.todoLists;

    ngOnInit(): void {
        this.todoListsService.load$.next();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSelectedChange($event: any) {
        const event = $event;
        return event;
    }

    openCreateDialog(): void {
        this.dialog
            .open(TodoListCreateDialog)
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((title) => {
                if (!title) {
                    return;
                }

                this.todoListsService.add$.next({ title });
            });
    }

    openEditPage(todoList: TodoList): void {
        this.router.navigate([RouteConstants.TODO, RouteConstants.LIST, todoList.id]);
    }

    openDeleteDialog(todoList: TodoList, $event: Event): void {
        $event.stopPropagation();

        this.dialog
            .open(TodoListDeleteDialog)
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((deleteConfirmed) => {
                if (!deleteConfirmed) {
                    return;
                }

                this.todoListsService.remove$.next({ id: todoList.id });
            });
    }
}
