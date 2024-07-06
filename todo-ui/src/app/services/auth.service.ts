import { Injectable } from '@angular/core';
import { AuthService, AuthTokenDto } from '../openapi-client';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private accessToken: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
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

    login(email: string, password: string): Observable<AuthTokenDto | null> {
        return this.authService.authControllerLogin({ email, password }).pipe(
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setToken(tokens.accessToken);
                this.router.navigate(['/todoList']);
            }),
            catchError((error) => {
                console.error(error);
                return of(null);
            }),
        );
    }

    logout(): Observable<void> {
        return this.authService.authControllerLogout().pipe(
            tap(() => this.clearToken()),
            catchError((error) => {
                console.error(error);
                return of();
            }),
        );
    }

    register(email: string, password: string): Observable<AuthTokenDto | null> {
        return this.authService.authControllerRegister({ email, password }).pipe(
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setToken(tokens.accessToken);
                this.router.navigate(['/todoList']);
            }),
            catchError((error) => {
                console.error(error);
                return of(null);
            }),
        );
    }

    refresh(): Observable<AuthTokenDto | null> {
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
        );
    }
}
