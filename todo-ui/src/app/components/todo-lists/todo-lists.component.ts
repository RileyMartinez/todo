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

@Component({
    selector: 'app-todo-lists',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatIconModule],
    templateUrl: './todo-lists.component.html',
    styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent implements OnInit {
    private readonly todoService = inject(TodoService);
    private readonly createListDialog = inject(MatDialog);

    todoLists: TodoList[] = [];

    ngOnInit(): void {
        this.loadTodoLists();
    }

    loadTodoLists(): void {
        this.todoService.getTodoLists().subscribe((todoLists) => {
            this.todoLists = todoLists;
        });
    }

    openCreateDialog(): void {
        const dialogRef = this.createListDialog.open(TodoListCreateDialog);

        dialogRef.afterClosed().subscribe((title) => {
            if (!title) {
                return;
            }

            this.todoService.createTodoList(title).subscribe((todoList) => {
                if (todoList) {
                    this.todoLists.push(todoList);
                }
            });
        });
    }
}
