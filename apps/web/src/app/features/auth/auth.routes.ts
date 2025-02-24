import { Routes } from '@angular/router';
import { OAuthCallbackComponent } from '../../core/auth/oauth-callback.component';
import { RouteConstants } from '../../core/constants/route.constants';
import { LoginOrRegisterComponent } from './login-or-register/login-or-register.component';
import { OneTimeLoginComponent } from './one-time-login/one-time-login.component';

export const AUTH_ROUTES: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN, pathMatch: 'full' },
    { path: RouteConstants.LOGIN, component: LoginOrRegisterComponent },
    { path: RouteConstants.OTP_LOGIN, component: OneTimeLoginComponent },
    { path: RouteConstants.OAUTH_CALLBACK, component: OAuthCallbackComponent },
];
