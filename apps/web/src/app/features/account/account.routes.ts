import { Routes } from '@angular/router';
import { RouteConstants } from '../../core/constants/route.constants';
import { ProfileComponent } from './profile/profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyAccountComponent } from './verify-account/verify-account.component';

export const ACCOUNT_ROUTES: Routes = [
    { path: RouteConstants.ROOT, redirectTo: RouteConstants.LOGIN, pathMatch: 'full' },
    { path: RouteConstants.VERIFY, component: VerifyAccountComponent },
    { path: RouteConstants.RESET_PASSWORD, component: ResetPasswordComponent },
    { path: RouteConstants.PROFILE, component: ProfileComponent },
];
