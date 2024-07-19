import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatActionList, MatListModule } from '@angular/material/list';
import { TodoList } from '../../openapi-client';
import { MatDialog } from '@angular/material/dialog';
import { TodoListCreateDialog } from '../dialogs/todo-list-create.dialog';
import { BehaviorSubject, first, map } from 'rxjs';
import { TodoListDeleteDialog } from '../dialogs/todo-list-delete.dialog';
import { MatLineModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { RouteConstants } from '../../constants/route.constants';
import { TodoListProvider } from '../../providers/todolist.provider';

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
    private readonly todoListProvider = inject(TodoListProvider);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);

    private listsSubject = new BehaviorSubject<TodoList[]>([]);
    lists$ = this.listsSubject.asObservable();

    ngOnInit(): void {
        this.todoListProvider
            .getTodoLists()
            .pipe(
                first(),
                map((todoLists) => todoLists.sort((a, b) => a.id - b.id)),
            )
            .subscribe((todoLists) => {
                this.listsSubject.next(todoLists);
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

                this.todoListProvider
                    .createTodoList(title)
                    .pipe(first())
                    .subscribe((todoList) => {
                        if (todoList) {
                            this.listsSubject.next([...this.listsSubject.value, todoList]);
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

                this.todoListProvider
                    .deleteTodoList(todoList.id)
                    .pipe(first())
                    .subscribe(() => {
                        this.listsSubject.next(this.listsSubject.value.filter((list) => list.id !== todoList.id));
                    });
            });
    }
}
