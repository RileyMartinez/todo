import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
    selector: 'todo-list-delete-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose, MatButton],
    templateUrl: './todo-list-delete.dialog.html',
})
export class TodoListDeleteDialog {}
