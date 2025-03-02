import { Routes } from '@angular/router';
import { RouteConstants } from '../../core/constants/route.constants';
import { ResetPasswordComponent } from './reset-password/reset-password-component';

export const ACCOUNT_ROUTES: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN, pathMatch: 'full' },
    { path: RouteConstants.RESET_PASSWORD, component: ResetPasswordComponent },
];
