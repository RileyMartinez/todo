import { AuthService } from '@/modules/auth/auth.service';
import { AuthResultDto } from '@/modules/auth/dto/auth-result.dto';
import { MicrosoftGraphService } from '@/modules/auth/microsoft-graph.service';
import { AppConstants } from '@/shared/constants/app.constants';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { UrlUtil } from '@/shared/utils/url.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { MicrosoftStrategyOptions, Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftAuthStrategy extends PassportStrategy(Strategy, AppConstants.MICROSOFT_STRATEGY_NAME) {
    constructor(
        private readonly configService: ConfigService,
        private readonly urlUtil: UrlUtil,
        private readonly authService: AuthService,
        private readonly microsoftGraphService: MicrosoftGraphService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(ConfigConstants.MICROSOFT_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow<string>(ConfigConstants.MICROSOFT_OAUTH20_CLIENT_SECRET),
            callbackURL: `${urlUtil.getServerUrl()}/auth/microsoft/redirect`,
            scope: ['user.read', 'user.readbasic.all'],
        } as MicrosoftStrategyOptions);
    }

    async validate(accessToken: string, _refreshToken: string, profile: any): Promise<AuthResultDto | null> {
        if (!profile.emails) {
            return null;
        }

        const profilePicture = (await this.microsoftGraphService.getUserProfilePicture(accessToken)) ?? undefined;

        return await this.authService.passwordlessLoginOrRegister(profile.emails[0].value, profilePicture);
    }
}
