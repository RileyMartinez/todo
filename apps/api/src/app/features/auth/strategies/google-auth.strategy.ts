import { AppConstants } from '@/app/core/constants/app.constants';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { UrlUtil } from '@/app/core/utils/url.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AuthLoginResultDto } from '../dto/auth-login-result.dto';
import { PasswordlessLoginDto } from '../dto/passwordless-login.dto';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, AppConstants.GOOGLE_STRATEGY_NAME) {
    constructor(
        private readonly configService: ConfigService,
        private readonly urlUtil: UrlUtil,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(ConfigConstants.GOOGLE_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow<string>(ConfigConstants.GOOGLE_OAUTH20_CLIENT_SECRET),
            callbackURL: `${urlUtil.getServerUrl()}/auth/google/redirect`,
            scope: ['email', 'profile'],
        } as StrategyOptions);
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthLoginResultDto | null> {
        if (!profile.emails) {
            return null;
        }

        return await this.authService.passwordlessLoginOrRegister(
            new PasswordlessLoginDto(profile.emails[0].value, profile.photos?.[0].value),
        );
    }
}
