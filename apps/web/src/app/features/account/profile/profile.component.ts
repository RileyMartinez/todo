import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { matchValidator } from '../../../core/validators/match.validator';

interface Card {
    title: string;
    cols: number;
    rows: number;
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    standalone: true,
    imports: [
        MatGridListModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
    ],
})
export class ProfileComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);

    readonly userContext = this.authService.userContext;
    readonly user = this.userService.user;

    readonly cards: Card[] = [
        { title: 'Profile Information', cols: 1, rows: 1 },
        { title: 'Security', cols: 1, rows: 2 },
    ];

    passwordForm!: FormGroup;
    currentPasswordControl!: FormControl;
    newPasswordControl!: FormControl;
    confirmPasswordControl!: FormControl;

    displayNameForm!: FormGroup;
    displayNameControl!: FormControl;

    ngOnInit(): void {
        this.displayNameControl = new FormControl('', [Validators.required, Validators.minLength(1)]);

        this.displayNameForm = this.formBuilder.group({
            displayName: this.displayNameControl,
        });

        this.currentPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
        this.newPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
        this.confirmPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);

        this.passwordForm = this.formBuilder.group(
            {
                currentPassword: this.currentPasswordControl,
                newPassword: this.newPasswordControl,
                confirmPassword: this.confirmPasswordControl,
            },
            { validators: matchValidator('newPassword', 'confirmPassword') },
        );

        this.userService.getUser$.next();
    }

    updateDisplayName(): void {
        if (this.displayNameForm.invalid) {
            return;
        }

        this.userService.updateDisplayName$.next({
            displayName: this.displayNameControl.value,
        });
    }

    updatePassword(): void {
        if (this.passwordForm.invalid) {
            return;
        }

        if (this.currentPasswordControl.value === this.newPasswordControl.value) {
            this.newPasswordControl.setErrors({ passwordMatch: true });
            return;
        }

        this.userService.updatePassword$.next({
            password: this.newPasswordControl.value,
        });
    }
}
