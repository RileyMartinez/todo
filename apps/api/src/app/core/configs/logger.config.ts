import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams, Params } from 'nestjs-pino';
import { AppConstants } from '../constants/app.constants';
import { ConfigConstants } from '../constants/config.constants';

export const loggerConfig: LoggerModuleAsyncParams = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<Params> => {
        const env = configService.getOrThrow(ConfigConstants.APP_ENV);
        const level = configService.getOrThrow(ConfigConstants.LOGGER_LEVEL);

        return {
            pinoHttp: {
                level: level,
                transport: env === AppConstants.DEV ? { target: 'pino-pretty' } : undefined,
                customProps: (_req, _res) => ({
                    context: 'HTTP',
                }),
            },
        };
    },
};
