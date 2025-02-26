import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);

    req = req.clone({ withCredentials: true });

    return next(req).pipe(
        catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
            if (
                error.status === HttpStatusCode.Unauthorized &&
                !req.url.endsWith('login') &&
                !req.url.endsWith('register')
            ) {
                return handleRefresh(req, next);
            }

            return throwError(() => error);
        }),
    );

    function handleRefresh(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
        if (isRefreshing) {
            return next(req);
        }

        isRefreshing = true;

        return authService.refresh().pipe(
            switchMap(() => {
                isRefreshing = false;
                return next(req);
            }),
            catchError((error) => {
                isRefreshing = false;
                return throwError(() => error);
            }),
        );
    }
};
