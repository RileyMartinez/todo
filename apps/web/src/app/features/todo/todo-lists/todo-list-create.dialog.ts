import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'todo-list-create-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatIconButton,
        FormsModule,
        MatInput,
        MatIcon,
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
    selectedIcon: string = 'list';

    availableIcons = [
        // Common list icons
        'list',
        'checklist',
        'playlist_add_check',
        'format_list_bulleted',
        'assignment',
        // Task related
        'task',
        'task_alt',
        'check_circle',
        'done',
        'done_all',
        // Category icons
        'home',
        'work',
        'shopping_cart',
        'event',
        'directions_run',
        // Priority icons
        'flag',
        'star',
        'priority_high',
        'bolt',
        // Time related
        'schedule',
        'hourglass_empty',
        'today',
        'date_range',
        'alarm',
        // Additional themes
        'restaurant',
        'shopping_bag',
        'school',
        'travel_explore',
        'favorite',
        'fitness_center',
        'movie',
        'book',
        'music_note',
        'laptop',
        'account_balance',
        'celebration',
        'family_restroom',
        'pets',
    ];
}
