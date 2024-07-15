import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatActionList, MatListModule } from '@angular/material/list';
import { NgTodoListService } from '../../services/ng-todolist.service';
import { TodoList } from '../../openapi-client';
import { MatDialog } from '@angular/material/dialog';
import { TodoListCreateDialog } from '../dialogs/todo-list-create.dialog';
import { first } from 'rxjs';
import { TodoListDeleteDialog } from '../dialogs/todo-list-delete.dialog';
import { MatLineModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { RouteConstants } from '../../constants/route.constants';

@Component({
    selector: 'app-todo-lists',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatLineModule,
        MatActionList,
        MatListModule,
    ],
    templateUrl: './todo-lists.component.html',
    styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent implements OnInit {
    private readonly ngTodoListService = inject(NgTodoListService);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);

    lists: TodoList[] = [];

    ngOnInit(): void {
        this.ngTodoListService
            .getTodoLists()
            .pipe(first())
            .subscribe((todoLists) => {
                this.lists = todoLists;
            });
    }

    onSelectedChange($event: any) {
        const event = $event;
        return event;
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(TodoListCreateDialog);

        dialogRef
            .afterClosed()
            .pipe(first())
            .subscribe((title) => {
                if (!title) {
                    return;
                }

                this.ngTodoListService
                    .createTodoList(title)
                    .pipe(first())
                    .subscribe((todoList) => {
                        if (todoList) {
                            this.lists.push(todoList);
                        }
                    });
            });
    }

    openEditPage(todoList: TodoList): void {
        this.router.navigate([RouteConstants.TODO_LIST], {
            state: { todoList },
        });
    }

    openDeleteDialog(todoList: TodoList): void {
        const dialogRef = this.dialog.open(TodoListDeleteDialog);

        dialogRef
            .afterClosed()
            .pipe(first())
            .subscribe((deleteConfirmed) => {
                if (!deleteConfirmed) {
                    return;
                }

                this.ngTodoListService
                    .deleteTodoList(todoList.id)
                    .pipe(first())
                    .subscribe(() => {
                        this.lists = this.lists.filter((list) => list.id !== todoList.id);
                    });
            });
    }
}
