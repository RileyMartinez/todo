import { AppConstants } from '@/common/constants/app.constants';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class AzureAdAuthGuard extends AuthGuard(AppConstants.AZURE_AD_STRATEGY_NAME) {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }
}
