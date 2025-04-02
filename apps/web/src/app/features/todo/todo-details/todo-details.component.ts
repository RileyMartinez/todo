import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SidenavService } from '../../../core/services/sidenav.service';
import { Todo, TodoDto } from '../../../shared/openapi-client';
import { TodoListService } from '../todo-list/todo-list.service';

@Component({
    selector: 'app-todo-details',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatDatepickerModule,
        MatSlideToggleModule,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './todo-details.component.html',
})
export class TodoDetailsComponent implements OnInit {
    @Input() todo!: Todo;

    private readonly formBuilder = inject(FormBuilder);
    private readonly todoListService = inject(TodoListService);
    private readonly sidenavService = inject(SidenavService);

    detailsForm!: FormGroup;
    detailsTitleControl!: FormControl;
    detailsDescriptionControl!: FormControl;
    detailsDueDateControl!: FormControl;
    detailsCompletedControl!: FormControl;

    ngOnInit(): void {
        this.initializeDetailsForm();
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

        if (this.todo) {
            this.detailsForm.reset({
                title: this.todo.title,
                description: this.todo.description || '',
                dueDate: this.todo.dueDate ? new Date(this.todo.dueDate) : null,
                completed: this.todo.completed,
            });
        }
    }

    saveDetails(): void {
        if (this.detailsForm.invalid || !this.todo) {
            return;
        }

        const { todoList, ...item } = this.todo;
        const formValues = this.detailsForm.value;
        const updatedTodo: TodoDto = {
            ...item,
            title: formValues.title,
            description: formValues.description,
            dueDate: formValues.dueDate,
            completed: formValues.completed,
        };

        this.todoListService.update$.next(updatedTodo);
        this.sidenavService.close();
    }

    close(): void {
        this.sidenavService.close();
    }
}
