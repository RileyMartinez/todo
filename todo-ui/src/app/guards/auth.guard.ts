import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { AuthProvider } from '../providers/auth.provider';

export const authGuard: CanActivateFn = () => {
    const authProvider = inject(AuthProvider);
    const router = inject(Router);
    const user = authProvider.user();

    if (!user) {
        router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
        return false;
    }

    return true;
};
