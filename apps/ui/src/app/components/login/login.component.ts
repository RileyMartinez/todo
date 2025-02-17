import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatRipple } from '@angular/material/core';
import { environment } from '../../../environments/environment';
import { RouteConstants } from '../../constants/route.constants';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordDialog } from '../dialogs/forgot-password.dialog';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatIcon,
        MatTooltipModule,
        MatDivider,
        MatRipple,
    ],
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
    private readonly authService = inject(AuthService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();

    emailFormControl!: FormControl;
    passwordFormControl!: FormControl;
    loginForm!: FormGroup;
    hide = true;

    ngOnInit(): void {
        this.emailFormControl = new FormControl('', [Validators.email, Validators.required]);
        this.passwordFormControl = new FormControl('', Validators.required);

        this.loginForm = this.formBuilder.group({
            email: this.emailFormControl,
            password: this.passwordFormControl,
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.loginForm?.invalid) {
            return;
        }

        this.authService.login$.next({ email: this.emailFormControl.value, password: this.passwordFormControl.value });
    }

    onGoogleLogin(): void {
        window.location.href = `${environment.apiUrl}/${RouteConstants.AUTH_GOOGLE_LOGIN}`;
    }

    openForgotPasswordDialog(): void {
        this.dialog
            .open(ForgotPasswordDialog)
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((email) => {
                if (!email) {
                    return;
                }

                this.authService.requestPasswordReset$.next({ email });
                this.router.navigate([`/${RouteConstants.OTP_LOGIN}`], { queryParams: { email } });
            });
    }
}
