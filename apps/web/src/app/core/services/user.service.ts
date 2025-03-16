import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable, Subject, switchMap } from 'rxjs';
import {
    PasswordResetRequestDto,
    SafeUserDto,
    UpdateDisplayNameDto,
    UpdatePasswordDto,
    UserClient,
} from '../../shared/openapi-client';
import { NotificationConstants } from '../constants/notification.constants';
import { RouteConstants } from '../constants/route.constants';
import { SnackBarNotificationService } from './snack-bar.service';

export interface UserServiceState {
    loaded: boolean;
    user: SafeUserDto | undefined;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly userClient = inject(UserClient);
    private readonly snackBarNotificationService = inject(SnackBarNotificationService);
    private readonly router = inject(Router);

    // state
    private readonly state = signal<UserServiceState>({
        user: undefined,
        loaded: false,
        error: null,
    });

    // selectors
    readonly user = computed(() => this.state().user);
    readonly loaded = computed(() => this.state().loaded);
    readonly error = computed(() => this.state().error);

    // sources
    readonly getUser$ = new Subject<void>();
    readonly sendPasswordResetRequest$ = new Subject<PasswordResetRequestDto>();
    readonly updatePassword$ = new Subject<UpdatePasswordDto>();
    readonly updateDisplayName$ = new Subject<UpdateDisplayNameDto>();

    constructor() {
        // reducers
        this.getUser$
            .pipe(
                switchMap(() =>
                    this.userClient.userControllerGetUser().pipe(
                        catchError((error) => {
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((user) => {
                this.state.update((state) => ({ ...state, user, loaded: true }));
            });

        this.sendPasswordResetRequest$
            .pipe(
                switchMap((passwordResetRequestDto) =>
                    this.userClient.userControllerSendPasswordResetRequest(passwordResetRequestDto).pipe(
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

        this.updatePassword$
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

        this.updateDisplayName$
            .pipe(
                switchMap((updateDisplayNameDto) =>
                    this.userClient.userControllerUpdateDisplayName(updateDisplayNameDto).pipe(
                        catchError((error) => {
                            this.snackBarNotificationService.emit({
                                message: NotificationConstants.PROFILE_UPDATE_ERROR,
                            });
                            return this.handleError(error);
                        }),
                    ),
                ),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.snackBarNotificationService.emit({ message: NotificationConstants.PROFILE_UPDATE_SUCCESS });
            });
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error, loaded: true }));
        return EMPTY;
    }
}
