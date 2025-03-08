import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-oauth-callback',
    standalone: true,
    imports: [MatProgressSpinner],
    template: '<mat-spinner></mat-spinner>',
})
export class OAuthCallbackComponent implements OnInit {
    private readonly authService = inject(AuthService);

    ngOnInit() {
        this.authService.getUserContext$.next();
    }
}
