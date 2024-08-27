import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OneTimeLoginComponent } from './one-time-login/one-time-login.component';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabsModule, LoginComponent, RegisterComponent, OneTimeLoginComponent],
    templateUrl: './login-or-register.component.html',
})
export class LoginOrRegisterComponent {
    otpLoginVisible = false;
    email: string | undefined;

    updateOtpLoginVisibility(event: { show: boolean; email: string }): void {
        this.otpLoginVisible = event.show;
        this.email = event.email;
    }
}
