import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RouteConstants } from '../../../core/constants/route.constants';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-one-time-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatCardActions,
        MatTooltip,
        MatInput,
        MatFormField,
        MatLabel,
        MatError,
        MatButton,
        MatIconButton,
        MatIcon,
        RouterLink,
    ],
    templateUrl: './one-time-login.component.html',
})
export class OneTimeLoginComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly destroy$ = new Subject<void>();

    readonly routes = RouteConstants;

    email!: string | undefined;
    otpLoginForm!: FormGroup;
    otpFormControl!: FormControl;

    ngOnInit(): void {
        this.otpFormControl = new FormControl('', [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6),
            Validators.pattern('^[0-9]*$'),
        ]);

        this.otpLoginForm = this.formBuilder.group({
            otp: this.otpFormControl,
        });

        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.email = params['email'];
        });
    }

    onSubmit(): void {
        if (this.otpLoginForm.invalid || !this.email) {
            return;
        }

        this.authService.otpLogin$.next({ email: this.email, password: this.otpFormControl.value });
    }

    resendOtp(): void {
        if (!this.email) {
            return;
        }

        this.userService.sendPasswordResetRequest$.next({ email: this.email });
    }
}
