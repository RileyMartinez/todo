import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'todo-list-create-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatInputModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule],
    template: `
        <h2 mat-dialog-title>Create Todo List</h2>
        <mat-dialog-content>
            <p>Enter a title:</p>
            <mat-form-field>
                <mat-label>Title</mat-label>
                <input matInput [(ngModel)]="title" />
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button [mat-dialog-close]="undefined">Cancel</button>
            <button mat-button color="primary" [mat-dialog-close]="title" cdkFocusInitial>Create</button>
        </mat-dialog-actions>
    `,
})
export class TodoListCreateDialog {
    title = '';
}
