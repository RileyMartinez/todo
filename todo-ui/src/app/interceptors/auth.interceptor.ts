import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthProvider } from '../providers/auth.provider';
import { catchError, finalize, Observable, Subject, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject: Subject<string | undefined>;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authProvider = inject(AuthProvider);

    req = req.clone({ withCredentials: true });

    return authProvider.accessToken$.pipe(
        take(1),
        switchMap((accessToken) => {
            return handleRequestWithToken(req, next, accessToken);
        }),
    );

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
            return refreshTokenSubject.pipe(
                take(1),
                switchMap((token) => {
                    const updatedReq = setAuthorizationHeader(req, token);
                    return next(updatedReq);
                }),
            );
        }

        isRefreshing = true;
        refreshTokenSubject = new Subject<string | undefined>();

        return authProvider.refresh().pipe(
            switchMap((newToken) => {
                isRefreshing = false;
                refreshTokenSubject.next(newToken?.accessToken);
                refreshTokenSubject.complete();

                const updatedReq = setAuthorizationHeader(req, newToken?.accessToken);
                return next(updatedReq);
            }),
            catchError((error) => {
                isRefreshing = false;
                refreshTokenSubject.error(error);
                return throwError(() => error);
            }),
            finalize(() => {
                isRefreshing = false;
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
};
