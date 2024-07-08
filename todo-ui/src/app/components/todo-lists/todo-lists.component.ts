import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'app-todo-lists',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, MatListModule, MatIconModule],
    templateUrl: './todo-lists.component.html',
    styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent {}
