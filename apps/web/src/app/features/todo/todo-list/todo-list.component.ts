import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRipple } from '@angular/material/core';
import {
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { SidenavService } from '../../../core/services/sidenav.service';
import { Todo } from '../../../shared/openapi-client';
import { TodoListService } from './todo-list.service';

@Component({
    selector: 'app-todo-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCard,
        MatCardContent,
        MatIconButton,
        MatIcon,
        MatInput,
        MatFormFieldModule,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatListModule,
        MatCheckbox,
        MatSidenavModule,
        MatRipple,
    ],
    templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly todoListService = inject(TodoListService);
    private readonly sidenavService = inject(SidenavService);
    private readonly formBuilder = inject(FormBuilder);

    readonly todoList = this.todoListService.todoList;
    readonly incompleteTodos = computed(() => {
        return this.todoList()?.todos?.filter((todo) => !todo.completed) || [];
    });
    readonly completedTodos = computed(() => {
        return this.todoList()?.todos?.filter((todo) => todo.completed) || [];
    });

    todoForm!: FormGroup;
    todoFormControl!: FormControl;

    ngOnInit(): void {
        this.initializeTodoForm();

        const todoListId: string = this.route.snapshot.params['id'];
        this.todoListService.load$.next({ id: todoListId });
    }

    addTodoItem(todoListId: string, title: string): void {
        this.todoListService.add$.next({ todoListId, title, order: 1, completed: false });
        this.todoForm.reset();
        this.todoFormControl.setErrors(null);
    }

    updateTodoItemCompletion(item: Todo): void {
        const { todoList, ...todo } = item;
        todo.completed = !todo.completed;
        this.todoListService.update$.next(todo);
    }

    removeTodoItem(id: string): void {
        this.todoListService.remove$.next({ id });
    }

    showDetails(item: Todo): void {
        this.sidenavService.openDetails(item);
    }

    private initializeTodoForm() {
        this.todoFormControl = new FormControl('', Validators.required);
        this.todoForm = this.formBuilder.group({
            todo: this.todoFormControl,
        });
    }
}
