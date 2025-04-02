import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { UserContextService } from '../services/user-context.service';

export const verificationGuard: CanActivateFn = () => {
    const userContextStore = inject(UserContextService);
    const router = inject(Router);
    const userContext = userContextStore.userContext();

    if (userContext?.isVerified) {
        return true;
    }

    router.navigate([RouteConstants.ACCOUNT, RouteConstants.VERIFY]);
    return false;
};
