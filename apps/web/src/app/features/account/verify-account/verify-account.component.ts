import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { RouteConstants } from '../../../core/constants/route.constants';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-verify-account',
    imports: [
        ReactiveFormsModule,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatCardActions,
        MatInput,
        MatFormField,
        MatLabel,
        MatError,
        MatButton,
        MatIconButton,
        MatIcon,
        RouterLink,
    ],
    templateUrl: './verify-account.component.html',
})
export class VerifyAccountComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly formBuilder = inject(FormBuilder);

    readonly routes = RouteConstants;

    userContext = this.authService.userContext;
    verifyEmailForm!: FormGroup;
    verificationCodeFormControl!: FormControl;

    ngOnInit(): void {
        this.verificationCodeFormControl = new FormControl('', [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6),
            Validators.pattern('^[0-9]*$'),
        ]);

        this.verifyEmailForm = this.formBuilder.group({
            verificationCode: this.verificationCodeFormControl,
        });
    }

    onSubmit(): void {
        if (this.verifyEmailForm.invalid) {
            return;
        }

        this.authService.verifyAccount$.next({
            verificationCode: parseInt(this.verificationCodeFormControl.value),
        });
    }

    resendVerificationCode(): void {
        this.authService.sendAccountVerification$.next();
    }
}
