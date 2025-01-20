import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

let isRefreshing = false;
const refreshToken = signal<string | undefined>(undefined);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const accessToken = authService.accessToken();
    req = req.clone({ withCredentials: true });

    return handleRequestWithToken(req, next, accessToken);

    function handleRequestWithToken(
        req: HttpRequest<any>,
        next: HttpHandlerFn,
        accessToken: string | null,
    ): Observable<HttpEvent<any>> {
        const authReq = setAuthorizationHeader(req, accessToken);

        return next(authReq).pipe(
            catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                if (
                    error.status === HttpStatusCode.Unauthorized &&
                    !req.url.endsWith('login') &&
                    !req.url.endsWith('register')
                ) {
                    return refreshTokenAndRetry(req, next);
                }

                return throwError(() => error);
            }),
        );
    }

    function refreshTokenAndRetry(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
        if (isRefreshing) {
            return handleRequestWithNewToken(req, refreshToken(), next);
        }

        isRefreshing = true;

        return authService.refresh().pipe(
            switchMap((newToken) => {
                isRefreshing = false;
                refreshToken.set(newToken?.accessToken);

                return handleRequestWithNewToken(req, newToken?.accessToken, next);
            }),
            catchError((error) => {
                isRefreshing = false;
                refreshToken.set(undefined);
                return throwError(() => error);
            }),
        );
    }

    function setAuthorizationHeader(req: HttpRequest<any>, accessToken: string | null | undefined): HttpRequest<any> {
        if (!accessToken) {
            return req;
        }

        return req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
        });
    }

    function handleRequestWithNewToken(
        req: HttpRequest<any>,
        newToken: string | null | undefined,
        next: HttpHandlerFn,
    ): Observable<HttpEvent<any>> {
        const updatedReq = setAuthorizationHeader(req, newToken);
        return next(updatedReq);
    }
};
