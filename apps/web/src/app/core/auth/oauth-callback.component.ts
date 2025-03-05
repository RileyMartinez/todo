import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-oauth-callback',
    standalone: true,
    imports: [MatProgressSpinner],
    template: '<mat-spinner></mat-spinner>',
})
export class OAuthCallbackComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly authService = inject(AuthService);

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const sub = params['sub'];
            if (sub) {
                const isVerified = params['isVerified'] === 'true';
                this.authService.setSessonAndRedirect({ sub, isVerified });
            } else {
                this.authService.clearSessionAndRedirect();
            }
        });
    }
}
