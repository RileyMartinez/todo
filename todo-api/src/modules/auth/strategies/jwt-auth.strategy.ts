import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AppConstants } from 'src/common/constants';
import { ConfigConstants } from 'src/common/constants/config.constants';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, AppConstants.JWT_STRATEGY_NAME) {
    constructor(readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow(ConfigConstants.JWT_SECRET),
            ignoreExpiration: false,
        } as StrategyOptions);
    }

    validate(payload: any) {
        return payload;
    }
}
