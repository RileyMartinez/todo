import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { IdentityService } from '../services/identity.service';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const identityService = inject(IdentityService);

    return identityService.accessToken$.pipe(
        take(1),
        switchMap((accessToken) => {
            if (!accessToken) {
                return next(req);
            }

            return handleRequestWithToken(req, next, accessToken);
        }),
    );

    function handleRequestWithToken(
        req: HttpRequest<any>,
        next: HttpHandlerFn,
        accessToken: string,
    ): Observable<HttpEvent<any>> {
        const authReq = setAuthorizationHeader(req, accessToken);

        return next(authReq).pipe(
            catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                if (error.status === HttpStatusCode.Unauthorized) {
                    return refreshTokenAndRetry(req, next);
                }

                return throwError(() => error);
            }),
        );
    }

    function refreshTokenAndRetry(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
        return identityService.refresh().pipe(
            switchMap((newToken) => {
                if (!newToken?.accessToken) {
                    return throwError(() => new HttpErrorResponse({ status: HttpStatusCode.Unauthorized }));
                }

                const updatedReq = setAuthorizationHeader(req, newToken?.accessToken);
                return next(updatedReq);
            }),
        );
    }

    function setAuthorizationHeader(req: HttpRequest<any>, accessToken: string | undefined): HttpRequest<any> {
        if (!accessToken) {
            return req;
        }

        return req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
        });
    }
};
