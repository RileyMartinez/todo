import { AppConstants } from '@/common/constants/app.constants';
import { ConfigConstants } from '@/common/constants/config.constants';
import { UrlUtil } from '@/common/utils/url.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { MicrosoftStrategyOptions, Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';
import { AuthLoginResultDto } from '../dto/auth-login-result.dto';

@Injectable()
export class MicrosoftAuthStrategy extends PassportStrategy(Strategy, AppConstants.MICROSOFT_STRATEGY_NAME) {
    constructor(
        private readonly configService: ConfigService,
        private readonly urlUtil: UrlUtil,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(ConfigConstants.MICROSOFT_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow<string>(ConfigConstants.MICROSOFT_OAUTH20_CLIENT_SECRET),
            callbackURL: `${urlUtil.getServerUrl()}/auth/microsoft/redirect`,
            scope: ['user.read'],
        } as MicrosoftStrategyOptions);
    }

    async validate(_accessToken: string, _refreshToken: string, profile: any): Promise<AuthLoginResultDto | null> {
        if (!profile.emails) {
            return null;
        }

        return await this.authService.passwordlessLoginOrRegister(profile.emails[0].value);
    }
}
