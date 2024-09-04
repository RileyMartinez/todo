import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RegisterComponent } from '../register/register.component';
import { OneTimeLoginComponent } from '../one-time-login/one-time-login.component';
import { LoginComponent } from '../login';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabsModule, LoginComponent, RegisterComponent, OneTimeLoginComponent],
    templateUrl: './login-or-register.component.html',
})
export class LoginOrRegisterComponent {}
