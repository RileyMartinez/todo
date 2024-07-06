import { Injectable } from '@angular/core';
import { AccessTokenDto, AuthService } from '../openapi-client';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { RouteConstants } from '../constants/route.constants';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private accessToken: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService,
    ) {}

    private setToken(token: string): void {
        this.accessToken = token;
    }

    getToken(): string | null {
        return this.accessToken;
    }

    private clearToken(): void {
        this.accessToken = null;
    }

    login(email: string, password: string): Observable<AccessTokenDto | null> {
        this.loadingService.setLoading(true);
        return this.authService.authControllerLogin({ email, password }).pipe(
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setToken(tokens.accessToken);
                this.router.navigate([RouteConstants.TODO_LIST]);
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
            tap(() => this.clearToken()),
            catchError((error) => {
                console.error(error);
                return of();
            }),
            finalize(() => {
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
                this.router.navigate([RouteConstants.TODO_LIST]);
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
                return of(null);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }
}
