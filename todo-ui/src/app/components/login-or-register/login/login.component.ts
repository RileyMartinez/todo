import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthProvider } from '../../../providers/auth.provider';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
    private readonly authProvider = inject(AuthProvider);
    private readonly formBuilder = inject(FormBuilder);

    emailFormControl!: FormControl;
    passwordFormControl!: FormControl;
    loginForm!: FormGroup;

    ngOnInit(): void {
        this.emailFormControl = new FormControl('', [Validators.email, Validators.required]);
        this.passwordFormControl = new FormControl('', Validators.required);

        this.loginForm = this.formBuilder.group({
            email: this.emailFormControl,
            password: this.passwordFormControl,
        });
    }

    onSubmit(): void {
        if (this.loginForm?.invalid) {
            return;
        }

        this.authProvider.login(this.emailFormControl.value, this.passwordFormControl.value).subscribe();
    }
}
