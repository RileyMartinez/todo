import { inject, Injectable } from '@angular/core';
import { AccessTokenDto, AuthService } from '../openapi-client';
import { BehaviorSubject, catchError, finalize, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { RouteConstants } from '../constants/route.constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root',
})
export class IdentityService {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);

    private accessTokenSubject = new BehaviorSubject<string | null>(null);
    public readonly accessToken$ = this.accessTokenSubject.asObservable();

    private userSubject = new BehaviorSubject<User | null>(null);
    public readonly user$ = this.userSubject.asObservable();

    private setTokenAndUserIdentity(token: string): void {
        this.accessTokenSubject.next(token);
        const user = this.getUserFromToken(token);
        this.userSubject.next(user);
    }

    private clearTokenAndUserIdentity(): void {
        this.accessTokenSubject.next(null);
        this.userSubject.next(null);
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
            tap((tokens) => {
                if (!tokens) {
                    throw new Error('No tokens returned');
                }
                this.setTokenAndUserIdentity(tokens.accessToken);
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
                this.clearTokenAndUserIdentity();
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
                this.setTokenAndUserIdentity(tokens.accessToken);
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
                this.setTokenAndUserIdentity(tokens.accessToken);
            }),
            catchError((error) => {
                console.error(error);
                this.clearTokenAndUserIdentity();
                this.router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                return of(null);
            }),
            finalize(() => this.loadingService.setLoading(false)),
        );
    }
}
