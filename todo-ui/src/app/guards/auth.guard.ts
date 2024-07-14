import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, map } from 'rxjs';
import { RouteConstants } from '../constants/route.constants';
import { IdentityService } from '../services/identity.service';

export const authGuard: CanActivateFn = () => {
    const identityService = inject(IdentityService);
    const router = inject(Router);

    return identityService.accessToken$.pipe(
        take(1),
        map((accessToken) => {
            if (!accessToken) {
                router.navigate([RouteConstants.LOGIN_OR_REGISTER]);
                return false;
            }

            return true;
        }),
    );
};
