import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { ConfigConstants } from '../constants/config.constants';

export const corsConfigFactory = (configService: ConfigService): CorsOptions => {
    const basePath = configService.getOrThrow<string>(ConfigConstants.BASE_PATH);
    const webPort = configService.getOrThrow<string>(ConfigConstants.WEB_PORT);

    return {
        origin: [`${basePath}:${webPort}`],
        credentials: true,
    };
};
