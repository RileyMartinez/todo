import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { matchValidator } from '../../../core/validators/match.validator';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    standalone: true,
    imports: [
        MatGridListModule,
        MatCardModule,
        ReactiveFormsModule,
        MatFormField,
        MatIcon,
        MatLabel,
        MatInput,
        MatError,
        MatButton,
        MatDivider,
    ],
})
export class ProfileComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);

    readonly userContext = this.authService.userContext;
    readonly user = this.userService.user;

    passwordForm!: FormGroup;
    currentPasswordControl!: FormControl;
    newPasswordControl!: FormControl;
    confirmPasswordControl!: FormControl;

    displayNameForm!: FormGroup;
    displayNameControl!: FormControl;

    ngOnInit(): void {
        this.displayNameControl = new FormControl('');

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

        this.userService.load$.next();
    }

    updateDisplayName(): void {
        if (this.displayNameForm.invalid) {
            return;
        }

        this.userService.updateDisplayName$.next({
            displayName: this.displayNameControl.value?.trim() || null,
        });

        this.resetFormState(this.displayNameForm);
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
            currentPassword: this.currentPasswordControl.value,
            newPassword: this.newPasswordControl.value,
            confirmPassword: this.confirmPasswordControl.value,
        });

        this.resetFormState(this.passwordForm);
    }

    resetFormState(form: FormGroup): void {
        form.reset();
        form.markAsPristine();
        form.markAsUntouched();
        form.setErrors(null);
        form.updateValueAndValidity();
    }
}
