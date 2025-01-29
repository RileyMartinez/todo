import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
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
};

function handleRefresh(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    const authService = inject(AuthService);

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
