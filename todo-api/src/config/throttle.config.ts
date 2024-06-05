import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigConstants } from '../constants/config.constants';

export const throttlerConfig: ThrottlerAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => ({
        throttlers: [
            {
                limit: configService.get<number>(ConfigConstants.THROTTLE_LIMIT) || 60000,
                ttl: configService.get<number>(ConfigConstants.THROTTLE_TTL) || 10,
            },
        ],
    }),
    inject: [ConfigService],
};
