import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AppConstants } from 'src/common/constants';
import { ConfigConstants } from 'src/common/constants/config.constants';
import { Request } from 'express';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, AppConstants.JWT_STRATEGY_NAME) {
    constructor(readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.[ConfigConstants.ACCESS_TOKEN_COOKIE_NAME],
            ]),
            secretOrKey: configService.get(ConfigConstants.JWT_SECRET),
            ignoreExpiration: false,
        } as StrategyOptions);
    }

    validate(payload: any) {
        return payload;
    }
}
