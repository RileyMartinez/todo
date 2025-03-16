import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { RouteConstants } from '../../../core/constants/route.constants';
import { UserService } from '../../../core/services/user.service';
import { matchValidator } from '../../../core/validators/match.validator';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatCardActions,
        MatFormField,
        MatLabel,
        MatError,
        MatButton,
        MatIcon,
        MatIconButton,
        RouterLink,
        MatInput,
        MatTooltip,
    ],
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly userService = inject(UserService);

    readonly routes = RouteConstants;

    passwordFormControl!: FormControl;
    confirmPasswordFormControl!: FormControl;
    resetPasswordForm!: FormGroup;

    ngOnInit(): void {
        this.passwordFormControl = new FormControl('', [Validators.minLength(8), Validators.required]);
        this.confirmPasswordFormControl = new FormControl('', [Validators.minLength(8), Validators.required]);

        this.resetPasswordForm = this.formBuilder.group(
            {
                password: this.passwordFormControl,
                confirmPassword: this.confirmPasswordFormControl,
            },
            {
                validators: matchValidator('password', 'confirmPassword'),
            },
        );
    }

    resetPassword(): void {
        if (this.resetPasswordForm.invalid) {
            return;
        }

        this.userService.resetPassword$.next({
            password: this.confirmPasswordFormControl.value,
        });
    }
}
