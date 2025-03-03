import { AppConstants } from '@/app/core/constants/app.constants';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, AppConstants.JWT_REFRESH_STRATEGY_NAME) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.[ConfigConstants.REFRESH_TOKEN_COOKIE_NAME],
            ]),
            secretOrKey: configService.get(ConfigConstants.JWT_REFRESH_SECRET),
            passReqToCallback: true,
            ignoreExpiration: false,
        } as StrategyOptionsWithRequest);
    }

    async validate(req: Request, payload: any) {
        return {
            sub: payload.sub,
            refreshToken: req.cookies?.[ConfigConstants.REFRESH_TOKEN_COOKIE_NAME],
        };
    }
}
