import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigConstants } from '../constants/config.constants';

export const ThrottlerConfig: ThrottlerAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => ({
        throttlers: [
            {
                limit: configService.getOrThrow<number>(ConfigConstants.THROTTLE_LIMIT),
                ttl: configService.getOrThrow<number>(ConfigConstants.THROTTLE_TTL),
            },
        ],
    }),
    inject: [ConfigService],
};
