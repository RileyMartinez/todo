import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    ThrottlerAsyncOptions,
    ThrottlerModuleOptions,
} from '@nestjs/throttler';

export const throttlerConfig: ThrottlerAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (
        configService: ConfigService,
    ): Promise<ThrottlerModuleOptions> => ({
        throttlers: [
            {
                limit: +configService.get('THROTTLE_LIMIT'),
                ttl: +configService.get('THROTTLE_TTL'),
            },
        ],
    }),
    inject: [ConfigService],
};
