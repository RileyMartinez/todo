import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faDiscord, faFacebook, faGithub, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { environment } from '../../../../environments/environment';
import { RouteConstants } from '../../../core/constants/route.constants';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FaIconComponent,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatFormField,
        MatInput,
        MatLabel,
        MatError,
        MatButton,
        MatIconButton,
        MatIcon,
        MatSuffix,
        MatTooltip,
        MatDivider,
    ],
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);

    readonly routes = RouteConstants;
    readonly faGithub: IconDefinition = faGithub;
    readonly faGoogle: IconDefinition = faGoogle;
    readonly faDiscord: IconDefinition = faDiscord;
    readonly faFacebook: IconDefinition = faFacebook;
    readonly faMicrosoft: IconDefinition = faMicrosoft;

    emailFormControl!: FormControl;
    passwordFormControl!: FormControl;
    registerForm!: FormGroup;
    hide = true;

    ngOnInit(): void {
        this.emailFormControl = new FormControl('', [Validators.email, Validators.required]);
        this.passwordFormControl = new FormControl('', [Validators.minLength(8), Validators.required]);

        this.registerForm = this.formBuilder.group({
            email: this.emailFormControl,
            password: this.passwordFormControl,
        });
    }

    onSocialLogin(route: string): void {
        window.location.href = `${environment.API_BASE_PATH}/${route}`;
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            return;
        }

        this.authService.register$.next({
            email: this.emailFormControl.value,
            password: this.passwordFormControl.value,
        });
    }
}
