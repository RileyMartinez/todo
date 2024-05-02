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
    constructor(private formBuilder: FormBuilder) {}

    emailFormControl = new FormControl('', [
        Validators.email,
        Validators.required,
    ]);
    passwordFormControl = new FormControl('', Validators.required);

    loginForm: FormGroup = this.formBuilder.group({
        email: this.emailFormControl,
        password: this.passwordFormControl,
    });

    ngOnInit(): void {}

    onSubmit(): void {
        if (this.loginForm?.invalid) {
            return;
        }

        console.log(this.loginForm?.value);
    }
}
