import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRipple, NativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatError, MatFormFieldModule, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { Todo, TodoDto } from '../../../shared/openapi-client';
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
        MatError,
        MatButton,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        NativeDateModule,
        MatListModule,
        MatCheckbox,
        MatSidenavModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatRipple,
        MatLabel,
        MatHint,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    private readonly route = inject(ActivatedRoute);
    private readonly todoListService = inject(TodoListService);
    private readonly formBuilder = inject(FormBuilder);

    readonly todoList = this.todoListService.todoList;
    readonly incompleteTodos = computed(() => {
        return this.todoList()?.todos?.filter((todo) => !todo.completed) || [];
    });
    readonly completedTodos = computed(() => {
        return this.todoList()?.todos?.filter((todo) => todo.completed) || [];
    });
    readonly selectedTodo = signal<Todo | null>(null);

    todoForm!: FormGroup;
    todoFormControl!: FormControl;

    detailsForm!: FormGroup;
    detailsTitleControl!: FormControl;
    detailsDescriptionControl!: FormControl;
    detailsDueDateControl!: FormControl;
    detailsCompletedControl!: FormControl;

    ngOnInit(): void {
        this.initializeTodoForm();
        this.initializeDetailsForm();

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
        this.selectedTodo.set(item);

        this.detailsForm.reset({
            title: item.title,
            description: item.description || '',
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
            completed: item.completed,
        });

        this.sidenav.open();
    }

    saveDetails(): void {
        const selectedTodo = this.selectedTodo();
        if (this.detailsForm.invalid || !selectedTodo) {
            return;
        }

        const { todoList, ...item } = selectedTodo;
        const formValues = this.detailsForm.value;
        const updatedTodo: TodoDto = {
            ...item,
            title: formValues.title,
            description: formValues.description,
            dueDate: formValues.dueDate,
            completed: formValues.completed,
        };

        this.todoListService.update$.next(updatedTodo);
        this.sidenav.close();
    }

    private initializeDetailsForm() {
        this.detailsTitleControl = new FormControl('', Validators.required);
        this.detailsDescriptionControl = new FormControl('');
        this.detailsDueDateControl = new FormControl(null);
        this.detailsCompletedControl = new FormControl(false);
        this.detailsForm = this.formBuilder.group({
            title: this.detailsTitleControl,
            description: this.detailsDescriptionControl,
            dueDate: this.detailsDueDateControl,
            completed: this.detailsCompletedControl,
        });
    }

    private initializeTodoForm() {
        this.todoFormControl = new FormControl('', Validators.required);
        this.todoForm = this.formBuilder.group({
            todo: this.todoFormControl,
        });
    }
}
