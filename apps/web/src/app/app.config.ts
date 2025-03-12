import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { BASE_PATH } from './shared/openapi-client';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAppInitializer(() => {
            const authService = inject(AuthService);
            authService.loadUserContext$.next();
        }),
        { provide: BASE_PATH, useValue: environment.API_BASE_PATH },
    ],
};
