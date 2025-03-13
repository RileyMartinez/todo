import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabGroup, MatTab, LoginComponent, RegisterComponent],
    templateUrl: './login-or-register.component.html',
})
export class LoginOrRegisterComponent {}
