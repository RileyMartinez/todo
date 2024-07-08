import { Injectable } from '@angular/core';
import { AccessTokenDto, AuthService } from '../openapi-client';
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { RouteConstants } from '../constants/route.constants';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    public readonly accessToken$ = this.accessTokenSubject.asObservable();

    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService,
    ) {}

    isAuthenticated(): Observable<boolean> {
        return this.accessToken$.pipe(map((token) => !!token));
    }

    private setToken(token: string): void {
        this.accessTokenSubject.next(token);
    }

    private clearToken(): void {
        this.accessTokenSubject.next(null);
    }

    login(email: string, password: string): Observable<AccessTokenDto | null> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerLogin({ email, password }).pipe(
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setToken(tokens.accessToken);
                this.router.navigate([RouteConstants.TODO_LISTS]);
            }),
            catchError((error) => {
                console.error(error);
                return of(null);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    logout(): Observable<void> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerLogout().pipe(
            catchError((error) => {
                console.error(error);
                return of();
            }),
            finalize(() => {
                this.clearToken();
                this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                this.loadingService.setLoading(false);
            }),
        );
    }

    register(email: string, password: string): Observable<AccessTokenDto | null> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerRegister({ email, password }).pipe(
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setToken(tokens.accessToken);
                this.router.navigate([RouteConstants.TODO_LISTS]);
            }),
            catchError((error) => {
                console.error(error);
                return of(null);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }

    refresh(): Observable<AccessTokenDto | null> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerRefresh().pipe(
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setToken(tokens.accessToken);
            }),
            catchError((error) => {
                console.error(error);
                this.clearToken();
                this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                return of(null);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }
}
