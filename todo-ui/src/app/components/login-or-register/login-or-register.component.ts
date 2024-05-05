import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabsModule, LoginComponent, RegisterComponent],
    templateUrl: './login-or-register.component.html',
    styleUrl: './login-or-register.component.scss',
})
export class LoginOrRegisterComponent {}
