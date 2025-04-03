import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
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
import { Environment } from './core/models/environment.model';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { SidenavContent, SidenavService } from './core/services/sidenav.service';
import { SnackBarNotificationService } from './core/services/snack-bar.service';
import { UserContextService } from './core/services/user-context.service';
import { ViewPortService } from './core/services/viewport.service';
import { SearchComponent } from './features/todo/search.component';
import { TodoDetailsComponent } from './features/todo/todo-details/todo-details.component';
import { UserContextDto } from './shared/openapi-client';

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
        SearchComponent,
        TodoDetailsComponent,
    ],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly loadingService = inject(LoadingService);
    private readonly authService = inject(AuthService);
    private readonly userContextStore = inject(UserContextService);
    private readonly router = inject(Router);
    private readonly snackBarNotificationService = inject(SnackBarNotificationService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly viewportService = inject(ViewPortService);
    private readonly destroy$ = new Subject<void>();
    readonly sidenavService = inject(SidenavService);

    readonly routes = RouteConstants;
    readonly env: Environment = environment;
    readonly loading: Signal<boolean> = this.loadingService.loading;
    readonly userContext: Signal<UserContextDto | null> = this.userContextStore.userContext;
    readonly isMobile: Signal<boolean> = this.viewportService.isMobile;
    readonly sidenavContent: Signal<SidenavContent> = this.sidenavService.sidenavContent;
    readonly sidenavOpen: Signal<boolean> = this.sidenavService.sidenavOpen;

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
        this.sidenavService.close();
        this.router.navigate(route);
    }

    logout(): void {
        this.sidenavService.close();
        this.authService.logout$.next();
    }
}
