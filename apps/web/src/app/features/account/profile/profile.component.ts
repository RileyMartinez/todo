import { Component, inject, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { UserContextService } from '../../../core/services/user-context.service';
import { UserService } from '../../../core/services/user.service';
import { matchValidator } from '../../../core/validators/match.validator';
import { notMatchValidator } from '../../../core/validators/not-match.validator';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatCardActions,
        MatFormField,
        MatIcon,
        MatLabel,
        MatInput,
        MatError,
        MatButton,
        MatDivider,
        MatTooltip,
    ],
})
export class ProfileComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly userService = inject(UserService);
    private readonly userContextStore = inject(UserContextService);

    readonly userContext = this.userContextStore.userContext;

    passwordForm!: FormGroup;
    currentPasswordControl!: FormControl;
    newPasswordControl!: FormControl;
    confirmPasswordControl!: FormControl;

    displayNameForm!: FormGroup;
    displayNameControl!: FormControl;

    ngOnInit(): void {
        this.displayNameControl = new FormControl('', [this.displayNameValidator()]);

        this.displayNameForm = this.formBuilder.group({
            displayName: this.displayNameControl,
        });

        this.currentPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
        this.newPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
        this.confirmPasswordControl = new FormControl('', [Validators.required, Validators.minLength(8)]);

        this.passwordForm = this.formBuilder.group(
            {
                currentPassword: this.currentPasswordControl,
                newPassword: this.newPasswordControl,
                confirmPassword: this.confirmPasswordControl,
            },
            {
                validators: [
                    matchValidator('newPassword', 'confirmPassword'),
                    notMatchValidator('currentPassword', 'newPassword'),
                ],
            },
        );

        this.userService.load$.next();
    }

    updateDisplayName(): void {
        if (this.displayNameForm.invalid) {
            return;
        }

        this.userService.updateDisplayName$.next({
            displayName: this.displayNameControl.value?.trim() || null,
        });

        this.displayNameForm.reset();
        this.displayNameControl.setErrors(null);
    }

    updatePassword(): void {
        if (this.passwordForm.invalid) {
            return;
        }

        this.userService.updatePassword$.next({
            currentPassword: this.currentPasswordControl.value,
            newPassword: this.newPasswordControl.value,
            confirmPassword: this.confirmPasswordControl.value,
        });

        this.passwordForm.reset();
        Object.keys(this.passwordForm.controls).forEach((key) => {
            this.passwordForm.controls[key].setErrors(null);
        });
    }

    private displayNameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const currentDisplayName = this.userContext()?.displayName;
            const newDisplayName = control.value?.trim();

            if (newDisplayName === currentDisplayName || (!newDisplayName && !currentDisplayName)) {
                return { same: true };
            }

            return null;
        };
    }
}
