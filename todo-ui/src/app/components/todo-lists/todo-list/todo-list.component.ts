import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatActionList } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoListService } from '../../../services/todo-list.service';
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

        const todoListId = parseInt(this.route.snapshot.params['id']);
        this.todoListService.load$.next({ id: todoListId });
    }

    addTodoItem(id: number, title: string): void {
        this.todoListService.add$.next({ todoListId: id, title, order: 1, completed: false });
        this.todoFormControl.reset();
    }

    removeTodoItem(id: number): void {
        this.todoListService.remove$.next({ id });
    }

    goBack(): void {
        this.router.navigate([RouteConstants.TODO_LISTS]);
    }
}
