import { inject, Injectable } from '@angular/core';
import { AccessTokenDto, AuthService } from '../openapi-client';
import { BehaviorSubject, catchError, finalize, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { RouteConstants } from '../constants/route.constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class AuthProvider {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);

    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    public readonly accessToken$ = this.accessTokenSubject.asObservable();

    private userSubject = new BehaviorSubject<User | null>(null);
    public readonly user$ = this.userSubject.asObservable();

    constructor() {
        this.refreshSession();
    }

    login(email: string, password: string): void {
        this.loadingService.setLoading(true);

        this.authService
            .authControllerLogin({ email, password })
            .pipe(finalize(() => this.loadingService.setLoading(false)))
            .subscribe({
                next: (tokens) => {
                    this.setSessonAndRedirect(tokens.accessToken);
                },
                error: () => {
                    this.clearTokenAndUserIdentity();
                },
            });
    }

    logout(): void {
        this.loadingService.setLoading(true);

        this.authService
            .authControllerLogout()
            .pipe(
                finalize(() => {
                    this.clearSessionAndRedirect();
                    this.loadingService.setLoading(false);
                }),
            )
            .subscribe();
    }

    register(email: string, password: string): void {
        this.loadingService.setLoading(true);

        this.authService
            .authControllerRegister({ email, password })
            .pipe(finalize(() => this.loadingService.setLoading(false)))
            .subscribe({
                next: (tokens) => {
                    this.setSessonAndRedirect(tokens.accessToken);
                },
                error: () => {
                    this.clearTokenAndUserIdentity();
                },
            });
    }

    refresh(): Observable<AccessTokenDto | null> {
        return this.authService.authControllerRefresh().pipe(
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
        this.accessTokenSubject.next(token);
        this.userSubject.next(this.getUserFromToken(token));
        localStorage.setItem('todo.sub', this.userSubject.value?.sub.toString() || '');
    }

    private clearTokenAndUserIdentity(): void {
        this.accessTokenSubject.next(null);
        this.userSubject.next(null);
        localStorage.removeItem('todo.sub');
    }

    private getUserFromToken(token: string): User | null {
        try {
            return jwtDecode<User>(token);
        } catch {
            return null;
        }
    }

    private refreshSession(): void {
        const userId = parseInt(localStorage.getItem('todo.sub') || '0');
        if (userId) {
            this.userSubject.next({ sub: userId });
        }
    }

    private setSessonAndRedirect(token: string): void {
        this.setTokenAndUserIdentity(token);
        this.router.navigate([RouteConstants.TODO_LISTS]);
    }

    private clearSessionAndRedirect(): void {
        this.clearTokenAndUserIdentity();
        this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
    }
}
