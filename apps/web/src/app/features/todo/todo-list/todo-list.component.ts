import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
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
        CdkDrag,
        CdkDropList,
    ],
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.css',
})
export class TodoListComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly todoListService = inject(TodoListService);
    private readonly sidenavService = inject(SidenavService);
    private readonly formBuilder = inject(FormBuilder);

    readonly todoList = this.todoListService.todoList;
    readonly todos = this.todoList()?.todos ?? [];
    readonly incompleteTodos = computed(() => {
        const todoList = this.todoList();
        if (!todoList) {
            return [];
        }
        return todoList.todos.filter((todo) => !todo.completed).sort((a, b) => a.order - b.order);
    });
    readonly completedTodos = computed(() => {
        const todoList = this.todoList();
        if (!todoList) {
            return [];
        }
        return todoList.todos.filter((todo) => todo.completed).sort((a, b) => a.order - b.order);
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

    getDueDateColor(dateStr: string | null | undefined): string {
        if (!dateStr) {
            return '';
        }

        if (this.isOverDue(dateStr)) {
            return 'red';
        } else if (this.isDueSoon(dateStr)) {
            return 'orangered';
        } else {
            return '';
        }
    }

    onDragDrop(event: CdkDragDrop<Todo[]>): void {
        const todoList = this.todoList();

        if (!todoList) {
            return;
        }

        todoList.todos = event.container.data;
        moveItemInArray(todoList.todos, event.previousIndex, event.currentIndex);
        this.todoListService.updateTodoPositions$.next(todoList);
    }

    private isOverDue(dateStr: string | null | undefined): boolean {
        if (!dateStr) {
            return false;
        }

        const dueDateDt = new Date(dateStr);
        const todayDt = new Date();
        const dueDate = new Date(dueDateDt.getFullYear(), dueDateDt.getMonth(), dueDateDt.getDate());
        const today = new Date(todayDt.getFullYear(), todayDt.getMonth(), todayDt.getDate());

        return dueDate < today;
    }

    private isDueSoon(dateStr: string | null | undefined): boolean {
        if (!dateStr) {
            return false;
        }

        const dueDateDt = new Date(dateStr);
        const todayDt = new Date();
        const dueDate = new Date(dueDateDt.getFullYear(), dueDateDt.getMonth(), dueDateDt.getDate());
        const today = new Date(todayDt.getFullYear(), todayDt.getMonth(), todayDt.getDate());

        const dayThreshold = new Date(today);
        dayThreshold.setDate(today.getDate() + 2);

        return dueDate >= today && dueDate <= dayThreshold;
    }

    private initializeTodoForm() {
        this.todoFormControl = new FormControl('', Validators.required);
        this.todoForm = this.formBuilder.group({
            todo: this.todoFormControl,
        });
    }
}
