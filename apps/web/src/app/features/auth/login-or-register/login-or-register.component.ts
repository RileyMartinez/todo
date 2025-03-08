import { Component, inject, OnInit } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
    selector: 'app-login-or-register',
    standalone: true,
    imports: [MatTabGroup, MatTab, LoginComponent, RegisterComponent],
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
export class LoginOrRegisterComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly userContext = this.authService.userContext;

    ngOnInit(): void {
        if (this.userContext()) {
            this.authService.getUserContext$.next();
        }
    }
}
