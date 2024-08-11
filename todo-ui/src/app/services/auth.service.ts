import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AccessTokenDto, AuthClient, AuthLoginDto, AuthRegisterDto } from '../openapi-client';
import { catchError, EMPTY, first, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { RouteConstants } from '../constants/route.constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../interfaces/user.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface AuthServiceState {
    user: User | null;
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
        user: null,
        accessToken: null,
        loaded: false,
        error: null,
    });

    // selectors
    public readonly user = computed(() => this.state().user);
    public readonly accessToken = computed(() => this.state().accessToken);
    public readonly loaded = computed(() => this.state().loaded);
    public readonly error = computed(() => this.state().error);

    // sources
    public readonly login$ = new Subject<AuthLoginDto>();
    public readonly register$ = new Subject<AuthRegisterDto>();
    public readonly logout$ = new Subject<void>();

    constructor() {
        this.initUserSession();

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
            .subscribe();

        effect(() => this.loadingService.setLoading(!this.loaded()), { allowSignalWrites: true });
    }

    public refresh(): Observable<AccessTokenDto | null> {
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
        this.state.update((state) => ({ ...state, user: this.getUserFromToken(token), accessToken: token }));
        localStorage.setItem('todo.sub', this.user()?.sub.toString() || '');
    }

    private clearTokenAndUserIdentity(): void {
        this.state.update((state) => ({ ...state, user: null, accessToken: null }));
        localStorage.removeItem('todo.sub');
    }

    private getUserFromToken(token: string): User | null {
        try {
            return jwtDecode<User>(token);
        } catch {
            return null;
        }
    }

    private initUserSession(): void {
        const userId = parseInt(localStorage.getItem('todo.sub') || '0');
        this.state.update((state) => ({ ...state, user: { sub: userId }, loaded: true }));
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
