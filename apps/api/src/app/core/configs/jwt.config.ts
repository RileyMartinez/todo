import { ConfigConstants } from '@/app/core/constants/config.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
        secret: configService.getOrThrow(ConfigConstants.JWT_SECRET),
        signOptions: {
            expiresIn: configService.getOrThrow(ConfigConstants.JWT_EXPIRATION),
        },
    }),
    inject: [ConfigService],
};
