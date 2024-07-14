import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { IdentityService } from './services/identity.service';
import { Observable } from 'rxjs';
import { USER_OBSERVABLE_TOKEN } from './injection-tokens/user.token';
import { User } from './interfaces/user.interface';
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
    providers: [
        {
            provide: USER_OBSERVABLE_TOKEN,
            useFactory: () => inject(IdentityService).user$,
        },
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    loadingService = inject(LoadingService);
    identityService = inject(IdentityService);
    user$: Observable<User | null> = inject(USER_OBSERVABLE_TOKEN);

    @ViewChild('sidenav') sidenav: MatSidenav | undefined;
    loginOrRegisterRoute = RouteConstants.LOGIN_OR_REGISTER;
    title = 'todo-ui';
    isAuthenticated = false;
    user: User | null = null;

    ngOnInit(): void {
        this.user$.subscribe((user) => {
            this.user = user;
        });
    }

    logout(): void {
        this.sidenav?.close();
        this.identityService.logout().subscribe();
    }
}
