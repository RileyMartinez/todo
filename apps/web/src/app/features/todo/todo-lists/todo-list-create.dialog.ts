import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'todo-list-create-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        MatInput,
        MatFormField,
        MatDialogContent,
        MatDialogActions,
        MatDialogTitle,
        MatButton,
        MatDialogClose,
        MatLabel,
    ],
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
