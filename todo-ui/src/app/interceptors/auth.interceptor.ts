import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IdentityService } from '../services/identity.service';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly identityService = inject(IdentityService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.identityService.accessToken$.pipe(
            take(1),
            switchMap((accessToken) => {
                if (!accessToken) {
                    return next.handle(req);
                }

                return this.handleRequestWithToken(req, next, accessToken);
            }),
        );
    }

    private handleRequestWithToken(
        req: HttpRequest<any>,
        next: HttpHandler,
        accessToken: string,
    ): Observable<HttpEvent<any>> {
        const authReq = this.setAuthorizationHeader(req, accessToken);
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                if (error.status === HttpStatusCode.Unauthorized) {
                    return this.refreshTokenAndRetry(req, next);
                }

                return throwError(() => error);
            }),
        );
    }

    private refreshTokenAndRetry(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.identityService.refresh().pipe(
            switchMap((newToken) => {
                if (!newToken?.accessToken) {
                    return throwError(() => new HttpErrorResponse({ status: HttpStatusCode.Unauthorized }));
                }

                const updatedReq = this.setAuthorizationHeader(req, newToken?.accessToken);
                return next.handle(updatedReq);
            }),
        );
    }

    private setAuthorizationHeader(req: HttpRequest<any>, accessToken: string | undefined): HttpRequest<any> {
        if (!accessToken) {
            return req;
        }

        return req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
        });
    }
}
