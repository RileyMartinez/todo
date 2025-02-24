import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-one-time-login',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatTooltipModule,
    ],
    templateUrl: './one-time-login.component.html',
})
export class OneTimeLoginComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly formBuilder = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly destroy$ = new Subject<void>();

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

        this.authService.requestPasswordReset$.next({ email: this.email });
    }
}
