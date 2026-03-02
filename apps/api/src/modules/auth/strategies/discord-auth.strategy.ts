import { AuthService } from '@/modules/auth/auth.service';
import { AuthResultDto } from '@/modules/auth/dto/auth-result.dto';
import { AppConstants } from '@/shared/constants/app.constants';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { UrlUtil } from '@/shared/utils/url.util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-discord';

@Injectable()
export class DiscordAuthStrategy extends PassportStrategy(Strategy, AppConstants.DISCORD_STRATEGY_NAME) {
    constructor(
        private readonly configService: ConfigService,
        private readonly urlUtil: UrlUtil,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.getOrThrow<string>(ConfigConstants.DISCORD_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow<string>(ConfigConstants.DISCORD_OAUTH20_CLIENT_SECRET),
            callbackURL: `${urlUtil.getServerUrl()}/auth/discord/redirect`,
            scope: ['identify', 'email'],
        } as StrategyOptions);
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthResultDto | null> {
        if (!profile.email) {
            return null;
        }

        let avatar: string | undefined;
        if (profile.avatar) {
            avatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`;
        }

        return await this.authService.passwordlessLoginOrRegister(profile.email, avatar);
    }
}
