import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { SnackBarNotificationService } from './core/services/snack-bar.service';
import { ViewPortService } from './core/services/viewport.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatToolbar,
        MatIconButton,
        MatIcon,
        MatProgressBar,
        MatMenu,
        MatMenuItem,
        MatSidenav,
        MatSidenavContainer,
        MatSidenavContent,
        MatNavList,
        MatListItem,
        MatMenuTrigger,
        MatDivider,
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

    title = 'web';
    isAuthenticated = false;

    ngOnInit(): void {
        /*
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this.destroy$),
            )
            .subscribe(() => {
                if (this.userContext() && this.router.url.startsWith(`/${RouteConstants.AUTH}`)) {
                    this.router.navigate([RouteConstants.TODO, RouteConstants.LISTS]);
                }
            });
            */

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
