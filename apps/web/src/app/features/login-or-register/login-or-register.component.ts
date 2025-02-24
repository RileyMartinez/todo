import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabsModule, LoginComponent, RegisterComponent],
    template: `
        <div class="flex flex-col overflow-hidden">
            <mat-tab-group>
                <mat-tab label="Login">
                    <app-login></app-login>
                </mat-tab>
                <mat-tab label="Register">
                    <app-register></app-register>
                </mat-tab>
            </mat-tab-group>
        </div>
    `,
})
export class LoginOrRegisterComponent {}
