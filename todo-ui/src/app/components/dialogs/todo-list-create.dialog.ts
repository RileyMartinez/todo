import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'todo-list-create-dialog',
    templateUrl: 'todo-list-create.dialog.html',
    standalone: true,
    imports: [CommonModule, MatInputModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListCreateDialog {
    title = '';
}
