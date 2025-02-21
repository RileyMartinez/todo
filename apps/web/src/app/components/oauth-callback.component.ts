import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-oauth-callback',
    template: '<div>Processing login...</div>',
    standalone: true,
})
export class OAuthCallbackComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly authService = inject(AuthService);

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['sub']) {
                this.authService.setSessonAndRedirect(params['sub']);
            } else {
                this.authService.clearSessionAndRedirect();
            }
        });
    }
}
