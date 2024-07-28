import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatActionList } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoListProvider } from '../../../providers/todolist.provider';
import { RouteConstants } from '../../../constants/route.constants';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatLineModule } from '@angular/material/core';

@Component({
    selector: 'app-todo-list',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatLineModule,
        MatListModule,
        MatIconModule,
        MatActionList,
        MatListModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly todoListProvider = inject(TodoListProvider);
    private readonly formBuilder = inject(FormBuilder);

    todoForm!: FormGroup;
    todoFormControl!: FormControl;

    todoListId: number | undefined;
    todoList = this.todoListProvider.todoList;

    ngOnInit(): void {
        this.todoFormControl = new FormControl('', Validators.required);
        this.todoForm = this.formBuilder.group({
            todo: this.todoFormControl,
        });

        const todoListId = parseInt(this.route.snapshot.params['id']);
        this.todoListProvider.getTodoList(todoListId);
    }

    addTodoItem(id: number, title: string): void {
        this.todoListProvider.createTodoListItem(id, title);
        this.todoFormControl.reset();
    }

    removeTodoItem(id: number): void {
        this.todoListProvider.deleteTodoListItem(id);
    }

    goBack(): void {
        this.router.navigate([RouteConstants.TODO_LISTS]);
    }
}
