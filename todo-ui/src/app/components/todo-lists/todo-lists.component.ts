import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TodoService } from '../../services/todo.service';
import { TodoList } from '../../openapi-client';
import { USER_OBSERVABLE_TOKEN } from '../../injection-tokens/user.token';
import { AuthenticationService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TodoListCreateDialog } from '../dialogs/todo-list-create.dialog';

@Component({
    selector: 'app-todo-lists',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatIconModule],
    providers: [
        {
            provide: USER_OBSERVABLE_TOKEN,
            useFactory: () => {
                const authService = inject(AuthenticationService);
                return authService.user$;
            },
        },
    ],
    templateUrl: './todo-lists.component.html',
    styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent implements OnInit {
    private todoService = inject(TodoService);
    private createListDialog = inject(MatDialog);
    private user$: Observable<User | null> = inject(USER_OBSERVABLE_TOKEN);
    private user: User | null = null;

    todoLists: TodoList[] = [];

    ngOnInit(): void {
        this.user$.subscribe((user) => {
            this.user = user;
            this.loadTodoLists();
        });
    }

    loadTodoLists(): void {
        this.todoService.getTodoLists(this.user).subscribe((todoLists) => {
            this.todoLists = todoLists;
        });
    }

    openCreateDialog(): void {
        const dialogRef = this.createListDialog.open(TodoListCreateDialog);

        dialogRef.afterClosed().subscribe((title) => {
            if (!title) {
                return;
            }

            this.todoService.createTodoList(this.user, title).subscribe((todoList) => {
                if (todoList) {
                    this.todoLists.push(todoList);
                }
            });
        });
    }
}
