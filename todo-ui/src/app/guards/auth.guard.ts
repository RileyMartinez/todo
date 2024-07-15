import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, map } from 'rxjs';
import { RouteConstants } from '../constants/route.constants';
import { NgAuthService } from '../services/ng-auth.service';

export const authGuard: CanActivateFn = () => {
    const ngAuthService = inject(NgAuthService);
    const router = inject(Router);

    return ngAuthService.user$.pipe(
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
