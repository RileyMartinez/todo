import { AppConstants, ConfigConstants } from '@/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AuthLoginResultDto } from '../dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, AppConstants.GOOGLE_STRATEGY_NAME) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        const basePath = configService.getOrThrow<string>(ConfigConstants.BASE_PATH);
        const port = configService.getOrThrow<string>(ConfigConstants.PORT);

        super({
            clientID: configService.getOrThrow<string>(ConfigConstants.GOOGLE_OAUTH20_CLIENT_ID),
            clientSecret: configService.getOrThrow<string>(ConfigConstants.GOOGLE_OAUTH20_CLIENT_SECRET),
            callbackURL: `${basePath}:${port}/auth/google/redirect`,
            scope: ['email', 'profile'],
        } as StrategyOptions);

        this.authService = authService;
    }

    async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthLoginResultDto | null> {
        if (!profile.emails) {
            return null;
        }

        return await this.authService.passwordlessLoginOrRegister(profile.emails[0].value);
    }
}
