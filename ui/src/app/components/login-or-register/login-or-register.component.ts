import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RegisterComponent } from '../register/register.component';
import { LoginComponent } from '../login/login.component';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabsModule, LoginComponent, RegisterComponent],
    
    templateUrl: './login-or-register.component.html',
})
export class LoginOrRegisterComponent {}
