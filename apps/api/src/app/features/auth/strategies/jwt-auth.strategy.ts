import { AppConstants } from '@/app/core/constants/app.constants';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, AppConstants.JWT_STRATEGY_NAME) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.[ConfigConstants.ACCESS_TOKEN_COOKIE_NAME],
            ]),
            secretOrKey: configService.get(ConfigConstants.JWT_SECRET),
            ignoreExpiration: false,
        } as StrategyOptionsWithRequest);
    }

    validate(payload: any) {
        return payload;
    }
}
