import { Component, OnInit } from '@angular/core';
import { TodoList } from '../../../openapi-client';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatActionList } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-todo-list',
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
        MatFormFieldModule,
    ],
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit {
    todoList: TodoList | null = null;

    ngOnInit(): void {
        this.todoList = history.state.todoList;
    }

    addTodoItem(todo: string): string {
        return todo;
    }

    removeTodoItem(): void {}

    goBack(): void {}
}
