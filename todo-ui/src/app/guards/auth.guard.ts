import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, map } from 'rxjs';
import { RouteConstants } from '../constants/route.constants';
import { AuthProvider } from '../providers/auth.provider';

export const authGuard: CanActivateFn = () => {
    const authProvider = inject(AuthProvider);
    const router = inject(Router);

    return authProvider.user$.pipe(
        take(1),
        map((user) => {
            if (!user) {
                router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                return false;
            }

            return true;
        }),
    );
};
