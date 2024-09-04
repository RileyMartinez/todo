import { Routes } from '@angular/router';
import { LoginOrRegisterComponent } from './components/login-or-register/login-or-register.component';
import { TodoListComponent } from './components/todo-lists/todo-list/todo-list.component';
import { RouteConstants } from './constants/route.constants';
import { TodoListsComponent } from './components/todo-lists/todo-lists.component';
import { authGuard } from './guards/auth.guard';
import { OneTimeLoginComponent } from './components/one-time-login/one-time-login.component';

export const routes: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN_OR_REGISTER, pathMatch: 'full' },
    { path: RouteConstants.LOGIN_OR_REGISTER, component: LoginOrRegisterComponent },
    { path: RouteConstants.OTP_LOGIN, component: OneTimeLoginComponent },
    { path: RouteConstants.TODO_LISTS, component: TodoListsComponent, canActivate: [authGuard] },
    { path: `${RouteConstants.TODO_LIST}/:id`, component: TodoListComponent, canActivate: [authGuard] },
    { path: RouteConstants.WILDCARD, redirectTo: RouteConstants.LOGIN_OR_REGISTER },
];
