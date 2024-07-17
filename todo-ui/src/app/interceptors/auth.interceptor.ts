import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { NgAuthService } from '../services/ng-auth.service';
import { catchError, finalize, Observable, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const ngAuthService = inject(NgAuthService);

    req = req.clone({ withCredentials: true });

    return ngAuthService.accessToken$.pipe(
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
            return next(req);
        }

        isRefreshing = true;

        return ngAuthService.refresh().pipe(
            switchMap((newToken) => {
                isRefreshing = false;

                const updatedReq = setAuthorizationHeader(req, newToken?.accessToken);
                return next(updatedReq);
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
