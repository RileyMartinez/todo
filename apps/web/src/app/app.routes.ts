import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { OAuthCallbackComponent } from './core/auth/oauth-callback.component';
import { RouteConstants } from './core/constants/route.constants';
import { LoginOrRegisterComponent } from './features/login-or-register/login-or-register.component';
import { OneTimeLoginComponent } from './features/login-or-register/one-time-login/one-time-login.component';
import { TodoListComponent } from './features/todo-list/todo-list.component';
import { TodoListsComponent } from './features/todo-lists/todo-lists.component';

export const routes: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN_OR_REGISTER, pathMatch: 'full' },
    { path: RouteConstants.LOGIN_OR_REGISTER, component: LoginOrRegisterComponent },
    { path: RouteConstants.OTP_LOGIN, component: OneTimeLoginComponent },
    { path: RouteConstants.OAUTH_CALLBACK, component: OAuthCallbackComponent },
    { path: RouteConstants.TODO_LISTS, component: TodoListsComponent, canActivate: [authGuard] },
    { path: `${RouteConstants.TODO_LIST}/:id`, component: TodoListComponent, canActivate: [authGuard] },
    { path: RouteConstants.WILDCARD, redirectTo: RouteConstants.LOGIN_OR_REGISTER },
];
