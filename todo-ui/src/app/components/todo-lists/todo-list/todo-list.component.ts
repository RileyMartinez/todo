import { Component, OnInit } from '@angular/core';
import { TodoList } from '../../../openapi-client';

@Component({
    selector: 'app-todo-list',
    standalone: true,
    imports: [],
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit {
    todoList: TodoList | null = null;

    ngOnInit(): void {
        this.todoList = history.state.todoList;
    }
}
