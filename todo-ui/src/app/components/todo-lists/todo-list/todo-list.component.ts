import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatActionList } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute } from '@angular/router';
import { TodoListProvider } from '../../../providers/todolist.provider';

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
    private readonly route = inject(ActivatedRoute);
    private readonly todoListProvider = inject(TodoListProvider);

    todoListId: number = 0;
    todoList$ = this.todoListProvider.todoList$;

    ngOnInit(): void {
        this.todoListId = parseInt(this.route.snapshot.params['id']);
        this.todoListProvider.getTodoList(this.todoListId);
    }

    addTodoItem(todo: string): string {
        return todo;
    }

    removeTodoItem(): void {}

    goBack(): void {}
}
