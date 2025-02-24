import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../../../core/constants/route.constants';
import { TodoListService } from './todo-list.service';

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
        MatListModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly todoListService = inject(TodoListService);
    private readonly formBuilder = inject(FormBuilder);

    todoForm!: FormGroup;
    todoFormControl!: FormControl;

    todoList = this.todoListService.todoList;

    ngOnInit(): void {
        this.todoFormControl = new FormControl('', Validators.required);
        this.todoForm = this.formBuilder.group({
            todo: this.todoFormControl,
        });

        const todoListId: string = this.route.snapshot.params['id'];
        this.todoListService.load$.next({ id: todoListId });
    }

    addTodoItem(id: string, title: string): void {
        this.todoListService.add$.next({ todoListId: id, title, order: 1, completed: false });
        this.todoFormControl.reset();
    }

    removeTodoItem(id: string): void {
        this.todoListService.remove$.next({ id });
    }

    goBack(): void {
        this.router.navigate([RouteConstants.TODO, RouteConstants.LISTS]);
    }
}
