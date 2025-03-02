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
import { AuthService } from '../../../core/services/auth.service';
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
    template: `
        <form [formGroup]="resetPasswordForm" (ngSubmit)="resetPassword()">
            <div class="flex flex-col items-center p-14 space-y-4">
                <mat-card class="w-full max-w-[360px] sm:max-w-[400px] md:max-w-[600px]">
                    <mat-card-header class="mb-4">
                        <mat-card-title>Reset Password</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                        <mat-form-field appearance="fill" class="w-3/4">
                            <mat-label>Password</mat-label>
                            <input matInput type="password" [formControl]="passwordFormControl" required />
                            @if (passwordFormControl.hasError('minlength')) {
                                <mat-error>Password must be at least 8 characters long</mat-error>
                            }
                            @if (passwordFormControl.hasError('required')) {
                                <mat-error>Password is required</mat-error>
                            }
                        </mat-form-field>
                        <mat-form-field appearance="fill" class="w-3/4">
                            <mat-label>Confirm Password</mat-label>
                            <input matInput type="password" [formControl]="confirmPasswordFormControl" required />
                            @if (confirmPasswordFormControl.hasError('minlength')) {
                                <mat-error>Password must be at least 8 characters long</mat-error>
                            }
                            @if (confirmPasswordFormControl.hasError('required')) {
                                <mat-error>Confirm Password is required</mat-error>
                            }
                            @if (confirmPasswordFormControl.hasError('mismatch')) {
                                <mat-error>Passwords do not match</mat-error>
                            }
                        </mat-form-field>
                        <div class="py-2">
                            <button mat-raised-button type="submit" [disabled]="resetPasswordForm.invalid">
                                <mat-icon>password</mat-icon>Reset
                            </button>
                        </div>
                    </mat-card-content>
                    <mat-card-actions>
                        <div matTooltip="Return to {{ routes.TODO }} {{ routes.LISTS }}">
                            <button mat-icon-button type="button" [routerLink]="['/', routes.TODO, routes.LISTS]">
                                <mat-icon>arrow_back</mat-icon>
                            </button>
                        </div>
                    </mat-card-actions>
                </mat-card>
            </div>
        </form>
    `,
})
export class ResetPasswordComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);

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

        this.authService.resetPassword$.next({
            password: this.confirmPasswordFormControl.value,
        });
    }
}
