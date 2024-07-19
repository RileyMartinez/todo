import { inject, Injectable } from '@angular/core';
import { AccessTokenDto, AuthService } from '../openapi-client';
import { BehaviorSubject, catchError, finalize, first, Observable, of, take, tap } from 'rxjs';
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

    private refreshSession(): void {
        const userId = parseInt(localStorage.getItem('todo.sub') || '0');
        if (userId) {
            this.userSubject.next({ sub: userId });
        }
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

    login(email: string, password: string): Observable<AccessTokenDto | null> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerLogin({ email, password }).pipe(
            first(),
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setTokenAndUserIdentity(tokens.accessToken);
                this.router.navigate([RouteConstants.TODO_LISTS]);
            }),
            catchError(() => of(null)),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    logout(): Observable<void> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerLogout().pipe(
            take(1),
            catchError(() => of(null)),
            finalize(() => {
                this.clearTokenAndUserIdentity();
                this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                this.loadingService.setLoading(false);
            }),
        );
    }

    register(email: string, password: string): Observable<AccessTokenDto | null> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerRegister({ email, password }).pipe(
            first(),
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setTokenAndUserIdentity(tokens.accessToken);
                this.router.navigate([RouteConstants.TODO_LISTS]);
            }),
            catchError(() => of(null)),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    refresh(): Observable<AccessTokenDto | null> {
        return this.authService.authControllerRefresh().pipe(
            first(),
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setTokenAndUserIdentity(tokens.accessToken);
            }),
            catchError(() => {
                this.clearTokenAndUserIdentity();
                this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                return of(null);
            }),
        );
    }
}