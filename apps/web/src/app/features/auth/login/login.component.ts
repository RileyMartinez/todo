import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
    faDiscord,
    faFacebook,
    faGithub,
    faGoogle,
    faMicrosoft,
    IconDefinition,
} from '@fortawesome/free-brands-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RouteConstants } from '../../../core/constants/route.constants';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ForgotPasswordDialog } from './forgot-password.dialog';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FaIconComponent,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatFormField,
        MatInput,
        MatLabel,
        MatError,
        MatButton,
        MatIconButton,
        MatIcon,
        MatSuffix,
        MatTooltip,
        MatDivider,
    ],
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();

    readonly routes = RouteConstants;
    readonly faGithub: IconDefinition = faGithub;
    readonly faGoogle: IconDefinition = faGoogle;
    readonly faDiscord: IconDefinition = faDiscord;
    readonly faFacebook: IconDefinition = faFacebook;
    readonly faMicrosoft: IconDefinition = faMicrosoft;

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

    onSocialLogin(route: string): void {
        window.location.href = `${environment.API_BASE_PATH}/${route}`;
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

                this.userService.sendPasswordResetRequest$.next({ email });
                this.router.navigate([RouteConstants.AUTH, RouteConstants.LOGIN, RouteConstants.OTP], {
                    queryParams: { email },
                });
            });
    }
}
