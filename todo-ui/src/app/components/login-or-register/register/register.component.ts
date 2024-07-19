import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthProvider } from '../../../providers/auth.provider';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authProvider = inject(AuthProvider);

    emailFormControl!: FormControl;
    passwordFormControl!: FormControl;
    registerForm!: FormGroup;

    ngOnInit(): void {
        this.emailFormControl = new FormControl('', [Validators.email, Validators.required]);
        this.passwordFormControl = new FormControl('', [Validators.minLength(8), Validators.required]);

        this.registerForm = this.formBuilder.group({
            email: this.emailFormControl,
            password: this.passwordFormControl,
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.authProvider.register(this.emailFormControl.value, this.passwordFormControl.value).subscribe();
    }
}
