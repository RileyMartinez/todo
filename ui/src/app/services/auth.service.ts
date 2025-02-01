import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
    AuthClient,
    AuthLoginRequestDto,
    AuthRegisterRequestDto,
    PasswordResetRequestDto,
    UserContextDto,
} from '../openapi-client';
import { catchError, EMPTY, first, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { RouteConstants } from '../constants/route.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackBarNotificationService } from './snack-bar.service';

export interface AuthServiceState {
    userContext: UserContextDto | null;
    loaded: boolean;
    error: string | null;
}

export const USER_CONTEXT_KEY: string = 'todo.sub';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly authClient = inject(AuthClient);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);
    private readonly snackBarNotificationService = inject(SnackBarNotificationService);

    // state
    private readonly state = signal<AuthServiceState>({
        userContext: null,
        loaded: false,
        error: null,
    });

    // selectors
    readonly userContext = computed(() => this.state().userContext);
    readonly loaded = computed(() => this.state().loaded);
    readonly error = computed(() => this.state().error);

    // sources
    readonly login$ = new Subject<AuthLoginRequestDto>();
    readonly otpLogin$ = new Subject<AuthLoginRequestDto>();
    readonly register$ = new Subject<AuthRegisterRequestDto>();
    readonly logout$ = new Subject<void>();
    readonly requestPasswordReset$ = new Subject<PasswordResetRequestDto>();

    constructor() {
        this.initUserSession();

        // reducers
        this.login$
            .pipe(
                switchMap((authLoginDto) =>
                    this.authClient.authControllerLogin(authLoginDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Invalid email or password' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((userContext) => {
                this.snackBarNotificationService.emit({ message: 'Login successful' });
                this.setSessonAndRedirect(userContext);
            });

        this.otpLogin$
            .pipe(
                switchMap((authLoginDto) =>
                    this.authClient.authControllerOneTimeLogin(authLoginDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Invalid one-time password' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((userContext) => {
                this.snackBarNotificationService.emit({ message: 'Login successful' });
                this.setSessonAndRedirect(userContext);
            });

        this.register$
            .pipe(
                switchMap((authRegisterDto) =>
                    this.authClient.authControllerRegister(authRegisterDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Registration failed' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((userContext) => {
                this.snackBarNotificationService.emit({ message: 'Registration successful' });
                this.setSessonAndRedirect(userContext);
            });

        this.logout$
            .pipe(
                switchMap(() =>
                    this.authClient.authControllerLogout().pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Something went wrong' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.snackBarNotificationService.emit({ message: 'Logout successful' });
                return this.clearSessionAndRedirect();
            });

        this.requestPasswordReset$
            .pipe(
                switchMap((passwordResetRequestDto) =>
                    this.authClient.authControllerSendPasswordResetRequest(passwordResetRequestDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Password reset email send failed' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.snackBarNotificationService.emit({ message: 'Password reset email sent' });
            });

        effect(() => this.loadingService.setLoading(!this.loaded()), { allowSignalWrites: true });
    }

    public refresh(): Observable<UserContextDto | null> {
        return this.authClient.authControllerRefresh().pipe(
            first(),
            tap((userContext) => {
                this.setTokenAndUserIdentity(userContext);
            }),
            catchError(() => {
                this.clearSessionAndRedirect();
                return of(null);
            }),
        );
    }

    public setSessonAndRedirect(userContext: UserContextDto): void {
        this.setTokenAndUserIdentity(userContext);
        this.router.navigate([RouteConstants.TODO_LISTS]);
    }

    public clearSessionAndRedirect(): void {
        this.clearTokenAndUserIdentity();
        this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
    }

    private setTokenAndUserIdentity(userContext: UserContextDto): void {
        this.state.update((state) => ({
            ...state,
            userContext,
        }));
        localStorage.setItem(USER_CONTEXT_KEY, this.userContext()?.sub.toString() || '');
    }

    private clearTokenAndUserIdentity(): void {
        this.state.update((state) => ({ ...state, userContext: null, loaded: true }));
        localStorage.removeItem(USER_CONTEXT_KEY);
    }

    private initUserSession(): void {
        const userId = localStorage.getItem(USER_CONTEXT_KEY);

        if (!userId) {
            this.clearTokenAndUserIdentity();
            return;
        }

        this.state.update((state) => ({ ...state, userContext: { sub: userId }, loaded: true }));
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        this.clearSessionAndRedirect();
        return EMPTY;
    }
}
