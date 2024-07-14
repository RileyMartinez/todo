import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, map } from 'rxjs';
import { RouteConstants } from '../constants/route.constants';
import { NgAuthService } from '../services/ng-auth.service';

export const authGuard: CanActivateFn = () => {
    const ngAuthService = inject(NgAuthService);
    const router = inject(Router);

    return ngAuthService.accessToken$.pipe(
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
