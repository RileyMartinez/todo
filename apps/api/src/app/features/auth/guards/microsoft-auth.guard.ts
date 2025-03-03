import { AppConstants } from '@/app/core/constants/app.constants';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard(AppConstants.MICROSOFT_STRATEGY_NAME) {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }
}
