import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { UserContextStore } from '../services/user-context.store';

export const authGuard: CanActivateFn = (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userContextStore = inject(UserContextStore);
    const router = inject(Router);
    const userContext = userContextStore.userContext();

    if (userContext) {
        return true;
    }

    if (state.url === `/${RouteConstants.ACCOUNT}/${RouteConstants.VERIFY}`) {
        return true;
    }

    router.navigate([RouteConstants.AUTH, RouteConstants.LOGIN]);
    return false;
};
