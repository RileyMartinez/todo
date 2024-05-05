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
import { LoadingService } from '../../../services/loading.service';

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
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
    emailFormControl!: FormControl;
    passwordFormControl!: FormControl;
    loginForm!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private loadingService: LoadingService,
    ) {}

    ngOnInit(): void {
        this.loadingService.triggerLoading();

        this.emailFormControl = new FormControl('', [
            Validators.email,
            Validators.required,
        ]);
        this.passwordFormControl = new FormControl('', Validators.required);

        this.loginForm = this.formBuilder.group({
            email: this.emailFormControl,
            password: this.passwordFormControl,
        });
    }

    onSubmit(): void {
        this.loadingService.setLoading(true);
        if (this.loginForm?.invalid) {
            return;
        }

        console.log(this.loginForm?.value);
        this.loadingService.setLoading(false);
    }
}
