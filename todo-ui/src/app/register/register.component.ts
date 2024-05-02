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
    constructor(private formBuilder: FormBuilder) {}

    emailFormControl = new FormControl('', [
        Validators.email,
        Validators.required,
    ]);
    passwordFormControl = new FormControl('', [
        Validators.minLength(8),
        Validators.required,
    ]);

    registerForm: FormGroup = this.formBuilder.group({
        email: this.emailFormControl,
        password: this.passwordFormControl,
    });

    ngOnInit(): void {}

    onSubmit(): void {
        if (this.registerForm?.invalid) {
            return;
        }

        console.log(this.registerForm?.value);
    }
}
