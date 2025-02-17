import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userContext = authService.userContext();

    if (!userContext) {
        router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
        return false;
    }

    return true;
};
