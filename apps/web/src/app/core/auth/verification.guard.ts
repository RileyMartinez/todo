import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { UserContextStore } from '../services/user-context.store';

export const verificationGuard: CanActivateFn = () => {
    const userContextStore = inject(UserContextStore);
    const router = inject(Router);
    const userContext = userContextStore.userContext();

    if (userContext?.isVerified) {
        return true;
    }

    router.navigate([RouteConstants.ACCOUNT, RouteConstants.VERIFY]);
    return false;
};
