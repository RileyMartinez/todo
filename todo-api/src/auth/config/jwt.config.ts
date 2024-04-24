import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigConstants } from './config.constants';

export const jwtConfig: JwtModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (
        configService: ConfigService,
    ): Promise<JwtModuleOptions> => ({
        secret: configService.get(ConfigConstants.JWT_SECRET),
        signOptions: {
            expiresIn: configService.get(ConfigConstants.JWT_EXPIRATION),
        },
    }),
    inject: [ConfigService],
};
