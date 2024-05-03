import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {
    FormGroup,
    FormBuilder,
    Validators,
    ReactiveFormsModule,
    FormControl,
} from '@angular/forms';
import { LoadingService } from '../loading.service';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        ReactiveFormsModule,
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
    emailFormControl!: FormControl;
    passwordFormControl!: FormControl;
    registerForm!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private loadingService: LoadingService,
        private authService: AuthService,
    ) {}

    ngOnInit(): void {
        this.loadingService.triggerLoading();

        this.emailFormControl = new FormControl('', [
            Validators.email,
            Validators.required,
        ]);
        this.passwordFormControl = new FormControl('', [
            Validators.minLength(8),
            Validators.required,
        ]);

        this.registerForm = this.formBuilder.group({
            email: this.emailFormControl,
            password: this.passwordFormControl,
        });
    }

    onSubmit(): void {
        this.loadingService.setLoading(true);
        if (this.registerForm.invalid) {
            return;
        }

        this.authService.register(
            this.registerForm.value.email,
            this.registerForm.value.password,
        );

        console.log(this.registerForm.value);
        this.loadingService.setLoading(false);
    }
}
