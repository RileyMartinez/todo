import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    ThrottlerAsyncOptions,
    ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ConfigConstants } from './config.constants';

export const throttlerConfig: ThrottlerAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (
        configService: ConfigService,
    ): Promise<ThrottlerModuleOptions> => ({
        throttlers: [
            {
                limit: Number(
                    configService.get(ConfigConstants.THROTTLE_LIMIT),
                ),
                ttl: Number(configService.get(ConfigConstants.THROTTLE_TTL)),
            },
        ],
    }),
    inject: [ConfigService],
};
