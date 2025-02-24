import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'forgot-password-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatInputModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
    ],
    template: `
        <form [formGroup]="passwordResetForm">
            <h2 mat-dialog-title>Forgot Password</h2>
            <mat-dialog-content>
                <p>We'll send you an email to reset your password.</p>
                <mat-form-field appearance="fill" class="w-3/4">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [formControl]="emailFormControl" autocomplete="email" required />
                </mat-form-field>
            </mat-dialog-content>
            <mat-dialog-actions>
                <button mat-button [mat-dialog-close]="undefined">Cancel</button>
                <button
                    mat-button
                    color="primary"
                    [mat-dialog-close]="emailFormControl.value"
                    [disabled]="passwordResetForm.invalid"
                >
                    Send
                </button>
            </mat-dialog-actions>
        </form>
    `,
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
}
