import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'todo-list-delete-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogModule, MatButtonModule],
    template: `
        <h2 mat-dialog-title>Delete Todo List</h2>
        <mat-dialog-content>
            <p>Are you sure you want to delete the list? All items will be lost.</p>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button [mat-dialog-close]="false">Cancel</button>
            <button mat-button color="primary" [mat-dialog-close]="true" cdkFocusInitial>Delete</button>
        </mat-dialog-actions>
    `,
})
export class TodoListDeleteDialog {}
