import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
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
import { environment } from '../environments/environment';
import { RouteConstants } from './core/constants/route.constants';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { SnackBarNotificationService } from './core/services/snack-bar.service';
import { UserContextStore } from './core/services/user-context.store';
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
        MatChip,
    ],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly loadingService = inject(LoadingService);
    private readonly authService = inject(AuthService);
    private readonly userContextStore = inject(UserContextStore);
    private readonly router = inject(Router);
    private readonly snackBarNotificationService = inject(SnackBarNotificationService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly viewportService = inject(ViewPortService);
    private readonly destroy$ = new Subject<void>();

    @ViewChild('sidenav') sidenav!: MatSidenav;

    readonly routes = RouteConstants;
    readonly loading = this.loadingService.loading;
    readonly userContext = this.userContextStore.userContext;
    readonly isMobile = this.viewportService.isMobile;
    readonly env = environment;

    ngOnInit(): void {
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

    navigateTo(route: string[]): void {
        this.sidenav.close();
        this.router.navigate(route);
    }

    logout(): void {
        this.sidenav.close();
        this.authService.logout$.next();
    }
}
