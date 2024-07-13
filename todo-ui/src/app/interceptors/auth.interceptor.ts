import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IdentityService } from '../services/identity.service';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private readonly identityService: IdentityService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.identityService.accessToken$.pipe(
            take(1), // Take the current value and complete
            switchMap((accessToken) => {
                if (!accessToken) {
                    return next.handle(req);
                }

                const authReq = this.setAuthorizationHeader(req, accessToken);
                return next.handle(authReq).pipe(
                    catchError((error: HttpErrorResponse): Observable<HttpEvent<any>> => {
                        if (error.status === HttpStatusCode.Unauthorized) {
                            return this.identityService.refresh().pipe(
                                switchMap((newToken) => {
                                    const updatedReq = this.setAuthorizationHeader(req, newToken?.accessToken);
                                    return next.handle(updatedReq);
                                }),
                            );
                        }
                        return throwError(() => error);
                    }),
                );
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
