import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AccessTokenResponseDto, AuthClient, AuthLoginRequestDto, AuthRegisterRequestDto } from '../openapi-client';
import { catchError, EMPTY, first, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { RouteConstants } from '../constants/route.constants';
import { jwtDecode } from 'jwt-decode';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserContext } from '../interfaces';

export interface AuthServiceState {
    userContext: UserContext | null;
    accessToken: string | null;
    loaded: boolean;
    error: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly authClient = inject(AuthClient);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);

    // state
    private readonly state = signal<AuthServiceState>({
        userContext: null,
        accessToken: null,
        loaded: false,
        error: null,
    });

    // selectors
    public readonly userContext = computed(() => this.state().userContext);
    public readonly accessToken = computed(() => this.state().accessToken);
    public readonly loaded = computed(() => this.state().loaded);
    public readonly error = computed(() => this.state().error);

    // sources
    public readonly login$ = new Subject<AuthLoginRequestDto>();
    public readonly register$ = new Subject<AuthRegisterRequestDto>();
    public readonly logout$ = new Subject<void>();

    constructor() {
        this.initUserSession();

        // reducers
        this.login$
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap((authLoginDto) =>
                    this.authClient
                        .authControllerLogin(authLoginDto)
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((tokens) => this.setSessonAndRedirect(tokens.accessToken));

        this.register$
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap((authRegisterDto) =>
                    this.authClient
                        .authControllerRegister(authRegisterDto)
                        .pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe((tokens) => this.setSessonAndRedirect(tokens.accessToken));

        this.logout$
            .pipe(
                tap(() => this.state.update((state) => ({ ...state, loaded: false }))),
                switchMap(() =>
                    this.authClient.authControllerLogout().pipe(catchError((error) => this.handleError(error))),
                ),
                takeUntilDestroyed(),
            )
            .subscribe(() => this.clearSessionAndRedirect());

        effect(() => this.loadingService.setLoading(!this.loaded()), { allowSignalWrites: true });
    }

    public refresh(): Observable<AccessTokenResponseDto | null> {
        return this.authClient.authControllerRefresh().pipe(
            first(),
            tap((tokens) => {
                this.setTokenAndUserIdentity(tokens.accessToken);
            }),
            catchError(() => {
                this.clearSessionAndRedirect();
                return of(null);
            }),
        );
    }

    private setTokenAndUserIdentity(token: string): void {
        this.state.update((state) => ({
            ...state,
            userContext: this.getUserContextFromToken(token),
            accessToken: token,
            loaded: true,
        }));
        localStorage.setItem('todo.sub', this.userContext()?.sub.toString() || '');
    }

    private clearTokenAndUserIdentity(): void {
        this.state.update((state) => ({ ...state, userContext: null, accessToken: null, loaded: true }));
        localStorage.removeItem('todo.sub');
    }

    private getUserContextFromToken(token: string): UserContext | null {
        try {
            return jwtDecode<UserContext>(token);
        } catch {
            return null;
        }
    }

    private initUserSession(): void {
        const userId = localStorage.getItem('todo.sub');

        if (!userId) {
            this.clearTokenAndUserIdentity();
            return;
        }

        this.state.update((state) => ({ ...state, userContext: { sub: userId }, loaded: true }));
    }

    private setSessonAndRedirect(token: string): void {
        this.setTokenAndUserIdentity(token);
        this.router.navigate([RouteConstants.TODO_LISTS]);
    }

    private clearSessionAndRedirect(): void {
        this.clearTokenAndUserIdentity();
        this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
    }

    private handleError(error: any): Observable<never> {
        this.state.update((state) => ({ ...state, error }));
        this.clearSessionAndRedirect();
        return EMPTY;
    }
}
