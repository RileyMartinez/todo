import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userContext = authService.userContext();

    if (userContext) {
        return true;
    }

    if (state.url === `/${RouteConstants.ACCOUNT}/${RouteConstants.VERIFY}`) {
        return true;
    }

    router.navigate([RouteConstants.AUTH, RouteConstants.LOGIN]);
    return false;
};
