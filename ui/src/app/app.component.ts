import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouteConstants } from './constants/route.constants';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        MatToolbarModule,
        MatButtonModule,
        MatIcon,
        RouterLink,
        MatProgressBarModule,
        CommonModule,
        MatMenuModule,
        MatSidenavModule,
        MatListModule,
    ],
    templateUrl: './app.component.html',
})
export class AppComponent {
    private readonly loadingService = inject(LoadingService);
    private readonly authService = inject(AuthService);

    @ViewChild('sidenav') sidenav: MatSidenav | undefined;

    loading = this.loadingService.loading;
    user = this.authService.user;

    loginOrRegisterRoute = RouteConstants.LOGIN_OR_REGISTER;
    title = 'ui';
    isAuthenticated = false;

    logout(): void {
        this.sidenav?.close();
        this.authService.logout$.next();
    }
}
