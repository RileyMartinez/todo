import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'forgot-password-dialog',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatInput,
        MatDialogTitle,
        MatDialogActions,
        MatDialogContent,
        MatDialogClose,
        MatButton,
        MatFormField,
        MatLabel,
    ],
    templateUrl: './forgot-password.dialog.html',
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
