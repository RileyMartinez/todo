import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TodoService } from '../../services/todo.service';
import { TodoList } from '../../openapi-client';
import { MatDialog } from '@angular/material/dialog';
import { TodoListCreateDialog } from '../dialogs/todo-list-create.dialog';
import { first, Observable } from 'rxjs';
import { TodoListDeleteDialog } from '../dialogs/todo-list-delete.dialog';
import { MatLineModule } from '@angular/material/core';

@Component({
    selector: 'app-todo-lists',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatIconModule, MatLineModule],
    templateUrl: './todo-lists.component.html',
    styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent implements OnInit {
    private readonly todoService = inject(TodoService);
    private readonly dialog = inject(MatDialog);

    todoLists$: Observable<TodoList[]> = new Observable<TodoList[]>();

    ngOnInit(): void {
        this.getTodoLists();
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

                this.todoService
                    .createTodoList(title)
                    .pipe(first())
                    .subscribe(() => this.getTodoLists());
            });
    }

    openDeleteDialog(todoListId: number): void {
        const dialogRef = this.dialog.open(TodoListDeleteDialog);

        dialogRef
            .afterClosed()
            .pipe(first())
            .subscribe((deleteConfirmed) => {
                if (!deleteConfirmed) {
                    return;
                }

                this.todoService
                    .deleteTodoList(todoListId)
                    .pipe(first())
                    .subscribe(() => this.getTodoLists());
            });
    }

    private getTodoLists(): void {
        this.todoLists$ = this.todoService.getTodoLists();
    }
}
