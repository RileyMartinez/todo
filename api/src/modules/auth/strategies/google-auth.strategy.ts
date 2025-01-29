import { AppConstants, ConfigConstants } from '@/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AuthLoginResultDto, AuthTokensDto } from '../dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, AppConstants.GOOGLE_STRATEGY_NAME) {
    constructor(
        readonly configService: ConfigService,
        readonly authService: AuthService,
    ) {
        const basePath = configService.getOrThrow(ConfigConstants.BASE_PATH);
        const port = configService.getOrThrow(ConfigConstants.PORT);

        super({
            clientID: configService.getOrThrow(ConfigConstants.GOOGLE_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow(ConfigConstants.GOOGLE_OAUTH20_CLIENT_SECRET),
            callbackURL: `${basePath}:${port}/auth/google/redirect`,
            scope: ['email', 'profile'],
        } as StrategyOptions);
    }

    async validate(accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthLoginResultDto | null> {
        if (!profile.emails) {
            return null;
        }

        const user = await this.authService.loginOrRegister({
            email: profile.emails[0].value,
            password: accessToken,
        });

        return user;
    }
}
