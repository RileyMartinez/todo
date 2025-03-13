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
    templateUrl: './todo-list-create.dialog.html',
})
export class TodoListCreateDialog {
    title = '';
}
