import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, first, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { UserClient, VerifyUserRequestDto } from '../../shared/openapi-client';
import { AuthClient } from '../../shared/openapi-client/api/auth.client';
import { AuthLoginRequestDto } from '../../shared/openapi-client/model/auth-login-request-dto';
import { AuthRegisterRequestDto } from '../../shared/openapi-client/model/auth-register-request-dto';
import { UserContextDto } from '../../shared/openapi-client/model/user-context-dto';
import { RouteConstants } from '../constants/route.constants';
import { LoadingService } from './loading.service';
import { SnackBarNotificationService } from './snack-bar.service';
import { UserContextStore } from './user-context.store';

export interface AuthServiceState {
    loaded: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly authClient = inject(AuthClient);
    private readonly userClient = inject(UserClient);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);
    private readonly snackBarNotificationService = inject(SnackBarNotificationService);
    private readonly userContextStore = inject(UserContextStore);

    // state
    private readonly state = signal<AuthServiceState>({
        loaded: false,
        error: null,
    });

    // selectors
    readonly loaded = computed(() => this.state().loaded);
    readonly error = computed(() => this.state().error);

    // sources
    readonly login$ = new Subject<AuthLoginRequestDto>();
    readonly otpLogin$ = new Subject<AuthLoginRequestDto>();
    readonly register$ = new Subject<AuthRegisterRequestDto>();
    readonly logout$ = new Subject<void>();
    readonly sendAccountVerification$ = new Subject<void>();
    readonly verifyAccount$ = new Subject<VerifyUserRequestDto>();
    readonly loadUserContext$ = new Subject<void>();

    constructor() {
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
                this.setUserContext(userContext);
                this.router.navigate([RouteConstants.ACCOUNT, RouteConstants.RESET_PASSWORD]);
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
                return this.clearSessionAndRedirect();
            });

        this.sendAccountVerification$
            .pipe(
                switchMap(() =>
                    this.userClient.userControllerSendAccountVerification().pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({
                                message: 'Account verification email send failed',
                            });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.snackBarNotificationService.emit({ message: 'Account verification email sent' });
            });

        this.verifyAccount$
            .pipe(
                switchMap((verifyUserRequestDto) =>
                    this.userClient.userControllerVerifyUser(verifyUserRequestDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Account verification failed' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((userContext) => {
                this.snackBarNotificationService.emit({ message: 'Account verified successfully' });
                this.setSessonAndRedirect(userContext);
            });

        this.loadUserContext$
            .pipe(
                switchMap(() =>
                    this.userClient.userControllerGetUserContext().pipe(
                        catchError((error) => {
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((userContext) => {
                this.setSessonAndRedirect(userContext);
            });

        effect(() => this.loadingService.setLoading(!this.loaded()));
    }

    public refresh(): Observable<UserContextDto | null> {
        return this.authClient.authControllerRefresh().pipe(
            first(),
            tap((userContext) => {
                this.setUserContext(userContext);
            }),
            catchError((error) => {
                this.handleError(error);
                return of(null);
            }),
        );
    }

    private setSessonAndRedirect(userContext: UserContextDto): void {
        this.setUserContext(userContext);

        if (userContext.isVerified) {
            this.router.navigate([RouteConstants.TODO, RouteConstants.LISTS]);
        } else {
            this.sendAccountVerification$.next();
            this.router.navigate([RouteConstants.ACCOUNT, RouteConstants.VERIFY]);
        }
    }

    private clearSessionAndRedirect(): void {
        this.clearUserContext();
        this.router.navigate([RouteConstants.AUTH, RouteConstants.LOGIN]);
    }

    private setUserContext(userContext: UserContextDto): void {
        this.state.update((state) => ({
            ...state,
            loaded: true,
        }));
        this.userContextStore.setUserContext(userContext);
    }

    private clearUserContext(): void {
        this.state.update((state) => ({ ...state, loaded: true }));
        this.userContextStore.clearUserContext();
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error, loaded: true }));
        this.clearSessionAndRedirect();
        return EMPTY;
    }
}
