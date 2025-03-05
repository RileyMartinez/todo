import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteConstants } from '../constants/route.constants';
import { AuthService } from '../services/auth.service';

export const verificationGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userContext = authService.userContext();

    if (userContext?.isVerified) {
        return true;
    }

    router.navigate([RouteConstants.ACCOUNT, RouteConstants.VERIFY]);
    return false;
};
