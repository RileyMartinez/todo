/**
 * Todo API
 * Todo List API with NestJS, TypeORM, and PostgreSQL
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpResponse,
    HttpEvent,
    HttpParameterCodec,
    HttpContext,
} from '@angular/common/http';
import { CustomHttpParameterCodec } from '../encoder';
import { Observable } from 'rxjs';

// @ts-ignore
import { AuthRegisterDto } from '../model/authRegisterDto';
// @ts-ignore
import { CreateUserDto } from '../model/createUserDto';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS } from '../variables';
import { Configuration } from '../configuration';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    protected basePath = 'http://localhost:3000';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(
        protected httpClient: HttpClient,
        @Optional() @Inject(BASE_PATH) basePath: string | string[],
        @Optional() configuration: Configuration,
    ) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            if (Array.isArray(basePath) && basePath.length > 0) {
                basePath = basePath[0];
            }

            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder =
            this.configuration.encoder || new CustomHttpParameterCodec();
    }

    // @ts-ignore
    private addToHttpParams(
        httpParams: HttpParams,
        value: any,
        key?: string,
    ): HttpParams {
        if (typeof value === 'object' && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(
        httpParams: HttpParams,
        value?: any,
        key?: string,
    ): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                (value as any[]).forEach(
                    (elem) =>
                        (httpParams = this.addToHttpParamsRecursive(
                            httpParams,
                            elem,
                            key,
                        )),
                );
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(
                        key,
                        (value as Date).toISOString().substring(0, 10),
                    );
                } else {
                    throw Error('key may not be null if value is Date');
                }
            } else {
                Object.keys(value).forEach(
                    (k) =>
                        (httpParams = this.addToHttpParamsRecursive(
                            httpParams,
                            value[k],
                            key != null ? `${key}.${k}` : k,
                        )),
                );
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error('key may not be null if value is not object or array');
        }
        return httpParams;
    }

    /**
     *
     * Handles the login request.
     * @param createUserDto Login credentials
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public authControllerLogin(
        createUserDto: CreateUserDto,
        observe?: 'body',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<string>;
    public authControllerLogin(
        createUserDto: CreateUserDto,
        observe?: 'response',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpResponse<string>>;
    public authControllerLogin(
        createUserDto: CreateUserDto,
        observe?: 'events',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpEvent<string>>;
    public authControllerLogin(
        createUserDto: CreateUserDto,
        observe: any = 'body',
        reportProgress: boolean = false,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<any> {
        if (createUserDto === null || createUserDto === undefined) {
            throw new Error(
                'Required parameter createUserDto was null or undefined when calling authControllerLogin.',
            );
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined =
            options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = ['application/json'];
            localVarHttpHeaderAcceptSelected =
                this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set(
                'Accept',
                localVarHttpHeaderAcceptSelected,
            );
        }

        let localVarHttpContext: HttpContext | undefined =
            options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }

        let localVarTransferCache: boolean | undefined =
            options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }

        // to determine the Content-Type header
        const consumes: string[] = ['application/json'];
        const httpContentTypeSelected: string | undefined =
            this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set(
                'Content-Type',
                httpContentTypeSelected,
            );
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (
                this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
            ) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/auth/login`;
        return this.httpClient.request<string>(
            'post',
            `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: createUserDto,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress,
            },
        );
    }

    /**
     *
     * Handles the logout request.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public authControllerLogout(
        observe?: 'body',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: undefined;
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<any>;
    public authControllerLogout(
        observe?: 'response',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: undefined;
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpResponse<any>>;
    public authControllerLogout(
        observe?: 'events',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: undefined;
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpEvent<any>>;
    public authControllerLogout(
        observe: any = 'body',
        reportProgress: boolean = false,
        options?: {
            httpHeaderAccept?: undefined;
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<any> {
        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (bearer) required
        localVarCredential = this.configuration.lookupCredential('bearer');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set(
                'Authorization',
                'Bearer ' + localVarCredential,
            );
        }

        let localVarHttpHeaderAcceptSelected: string | undefined =
            options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [];
            localVarHttpHeaderAcceptSelected =
                this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set(
                'Accept',
                localVarHttpHeaderAcceptSelected,
            );
        }

        let localVarHttpContext: HttpContext | undefined =
            options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }

        let localVarTransferCache: boolean | undefined =
            options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (
                this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
            ) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/auth/logout`;
        return this.httpClient.request<any>(
            'post',
            `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress,
            },
        );
    }

    /**
     *
     * Handles the registration request.
     * @param authRegisterDto
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public authControllerRegister(
        authRegisterDto: AuthRegisterDto,
        observe?: 'body',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<object>;
    public authControllerRegister(
        authRegisterDto: AuthRegisterDto,
        observe?: 'response',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpResponse<object>>;
    public authControllerRegister(
        authRegisterDto: AuthRegisterDto,
        observe?: 'events',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpEvent<object>>;
    public authControllerRegister(
        authRegisterDto: AuthRegisterDto,
        observe: any = 'body',
        reportProgress: boolean = false,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<any> {
        if (authRegisterDto === null || authRegisterDto === undefined) {
            throw new Error(
                'Required parameter authRegisterDto was null or undefined when calling authControllerRegister.',
            );
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined =
            options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = ['application/json'];
            localVarHttpHeaderAcceptSelected =
                this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set(
                'Accept',
                localVarHttpHeaderAcceptSelected,
            );
        }

        let localVarHttpContext: HttpContext | undefined =
            options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }

        let localVarTransferCache: boolean | undefined =
            options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }

        // to determine the Content-Type header
        const consumes: string[] = ['application/json'];
        const httpContentTypeSelected: string | undefined =
            this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set(
                'Content-Type',
                httpContentTypeSelected,
            );
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (
                this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
            ) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/auth/register`;
        return this.httpClient.request<object>(
            'post',
            `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: authRegisterDto,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress,
            },
        );
    }

    /**
     *
     * Handles the status request.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public authControllerStatus(
        observe?: 'body',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<string>;
    public authControllerStatus(
        observe?: 'response',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpResponse<string>>;
    public authControllerStatus(
        observe?: 'events',
        reportProgress?: boolean,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<HttpEvent<string>>;
    public authControllerStatus(
        observe: any = 'body',
        reportProgress: boolean = false,
        options?: {
            httpHeaderAccept?: 'application/json';
            context?: HttpContext;
            transferCache?: boolean;
        },
    ): Observable<any> {
        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (bearer) required
        localVarCredential = this.configuration.lookupCredential('bearer');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set(
                'Authorization',
                'Bearer ' + localVarCredential,
            );
        }

        let localVarHttpHeaderAcceptSelected: string | undefined =
            options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = ['application/json'];
            localVarHttpHeaderAcceptSelected =
                this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set(
                'Accept',
                localVarHttpHeaderAcceptSelected,
            );
        }

        let localVarHttpContext: HttpContext | undefined =
            options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }

        let localVarTransferCache: boolean | undefined =
            options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (
                this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
            ) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/auth/status`;
        return this.httpClient.request<string>(
            'get',
            `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                transferCache: localVarTransferCache,
                reportProgress: reportProgress,
            },
        );
    }
}
