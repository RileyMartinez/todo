import { AppConstants } from '@/shared/constants/app.constants';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { UrlUtil } from '@/shared/utils/url.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-github';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthLoginResultDto } from '@/modules/auth/dto/auth-login-result.dto';
import { PasswordlessLoginDto } from '@/modules/auth/dto/passwordless-login.dto';

@Injectable()
export class GitHubAuthStrategy extends PassportStrategy(Strategy, AppConstants.GITHUB_STRATEGY_NAME) {
    constructor(
        private readonly configService: ConfigService,
        private readonly urlUtil: UrlUtil,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(ConfigConstants.GITHUB_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow<string>(ConfigConstants.GITHUB_OAUTH20_CLIENT_SECRET),
            callbackURL: `${urlUtil.getServerUrl()}/auth/github/redirect`,
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
