import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'forgot-password-dialog',
    templateUrl: 'forgot-password.dialog.html',
    standalone: true,
    imports: [
        CommonModule,
        MatInputModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordDialog implements OnInit {
    private readonly formBuilder = inject(FormBuilder);

    passwordResetForm!: FormGroup;
    emailFormControl!: FormControl;

    ngOnInit(): void {
        this.emailFormControl = new FormControl('', [Validators.email, Validators.required]);

        this.passwordResetForm = this.formBuilder.group({
            email: this.emailFormControl,
        });
    }

    onSubmit(): void {
        if (this.passwordResetForm?.invalid) {
            return;
        }

        // Send password reset
    }
}
