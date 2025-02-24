import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { RouteConstants } from './core/constants/route.constants';

export const routes: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN, pathMatch: 'full' },
    { path: RouteConstants.AUTH, loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
    {
        path: RouteConstants.TODO,
        loadChildren: () => import('./features/todo/todo.routes').then((m) => m.TODO_ROUTES),
        canActivate: [authGuard],
    },
    { path: RouteConstants.WILDCARD, redirectTo: RouteConstants.LOGIN },
];
