import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services';

@Component({
    selector: 'app-one-time-login',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, ReactiveFormsModule],
    templateUrl: './one-time-login.component.html',
})
export class OneTimeLoginComponent implements OnInit {
    @Input() email: string | undefined;
    @Output() completeOtpLogin = new EventEmitter<{ show: boolean; email: string }>();
    private readonly authService = inject(AuthService);
    private readonly formBuilder = inject(FormBuilder);

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
    }

    onSubmit(): void {
        if (this.otpLoginForm.invalid || !this.email) {
            return;
        }

        this.authService.otpLogin$.next({ email: this.email, password: this.otpFormControl.value });
        this.completeOtpLogin.emit({ show: false, email: '' });
    }
}
