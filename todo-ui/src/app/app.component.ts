import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './services/loading.service';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouteConstants } from './constants/route.constants';
import { AuthenticationService } from './services/auth.service';
import { Subscription } from 'rxjs';

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
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    loginOrRegisterRoute = RouteConstants.LOGIN_OR_REGISTER;
    title = 'todo-ui';
    isAuthenticated = false;
    private authenticatedSubscription: Subscription = new Subscription();

    constructor(
        public loadingService: LoadingService,
        private authenticationService: AuthenticationService,
    ) {}

    ngOnInit(): void {
        this.authenticatedSubscription = this.authenticationService.isAuthenticated().subscribe((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
        });
    }

    ngOnDestroy(): void {
        this.authenticatedSubscription.unsubscribe();
    }

    logout(): void {
        this.authenticationService.logout().subscribe();
    }
}
