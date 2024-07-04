import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import { ConfigConstants } from 'src/common/constants/config.constants';
import { AppConstants } from 'src/common/constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, AppConstants.JWT_REFRESH_STRATEGY_NAME) {
    constructor(readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get(ConfigConstants.JWT_REFRESH_SECRET),
            passReqToCallback: true,
        } as StrategyOptions);
    }

    async validate(req: Request, payload: any) {
        const refreshToken = req.get('authorization')?.replace('Bearer ', '').trim();

        return {
            ...payload,
            refreshToken,
        };
    }
}
