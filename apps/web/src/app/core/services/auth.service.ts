import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, first, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { UpdatePasswordDto, UserClient, VerifyUserRequestDto } from '../../shared/openapi-client';
import { AuthClient } from '../../shared/openapi-client/api/auth.client';
import { AuthLoginRequestDto } from '../../shared/openapi-client/model/auth-login-request-dto';
import { AuthRegisterRequestDto } from '../../shared/openapi-client/model/auth-register-request-dto';
import { PasswordResetRequestDto } from '../../shared/openapi-client/model/password-reset-request-dto';
import { UserContextDto } from '../../shared/openapi-client/model/user-context-dto';
import { RouteConstants } from '../constants/route.constants';
import { LoadingService } from './loading.service';
import { SnackBarNotificationService } from './snack-bar.service';

export interface AuthServiceState {
    userContext: UserContextDto | null;
    loaded: boolean;
    error: string | null;
}

export const USER_CONTEXT_KEY: string = 'todo.sub';
export const USER_VERIFIED_KEY: string = 'todo.verified';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly authClient = inject(AuthClient);
    private readonly userClient = inject(UserClient);
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
    readonly resetPassword$ = new Subject<UpdatePasswordDto>();
    readonly requestAccountVerification$ = new Subject<void>();
    readonly verifyAccount$ = new Subject<VerifyUserRequestDto>();
    readonly loadUserContext$ = new Subject<void>();
    readonly userExists$ = new Subject<void>();

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

        this.resetPassword$
            .pipe(
                switchMap((updatePasswordDto) =>
                    this.userClient.userControllerUpdatePassword(updatePasswordDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({ message: 'Password reset failed' });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.snackBarNotificationService.emit({ message: 'Password reset successful' });
                this.router.navigate([RouteConstants.TODO, RouteConstants.LISTS]);
            });

        this.requestAccountVerification$
            .pipe(
                switchMap(() =>
                    this.authClient.authControllerSendAccountVerification().pipe(
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
            this.requestAccountVerification$.next();
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
            userContext,
            loaded: true,
        }));
    }

    private clearUserContext(): void {
        this.state.update((state) => ({ ...state, userContext: null, loaded: true }));
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error, loaded: true }));
        this.clearSessionAndRedirect();
        return EMPTY;
    }
}
