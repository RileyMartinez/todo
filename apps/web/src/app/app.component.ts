import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RouteConstants } from './core/constants/route.constants';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { SnackBarNotificationService } from './core/services/snack-bar.service';
import { ViewPortService } from './core/services/viewport.service';

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
        MatMenuTrigger,
    ],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly loadingService = inject(LoadingService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly snackBarNotificationService = inject(SnackBarNotificationService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly viewportService = inject(ViewPortService);
    private readonly destroy$ = new Subject<void>();

    @ViewChild('sidenav') sidenav: MatSidenav | undefined;

    loading = this.loadingService.loading;
    userContext = this.authService.userContext;
    isMobile = this.viewportService.isMobile;

    loginOrRegisterRoute = RouteConstants.LOGIN_OR_REGISTER;
    title = 'web';
    isAuthenticated = false;

    ngOnInit(): void {
        if (this.userContext()) {
            this.router.navigate([RouteConstants.TODO_LISTS]);
        }

        this.snackBarNotificationService.notifications$.pipe(takeUntil(this.destroy$)).subscribe((notification) => {
            this.snackBar.open(notification.message, notification.action, {
                duration: notification.duration,
                verticalPosition: 'top',
            });
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    logout(): void {
        this.sidenav?.close();
        this.authService.logout$.next();
    }
}
