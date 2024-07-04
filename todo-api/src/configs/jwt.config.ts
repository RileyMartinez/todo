import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigConstants } from 'src/constants/config.constants';

export const JwtConfig: JwtModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
        secret: configService.getOrThrow(ConfigConstants.JWT_SECRET),
        signOptions: {
            expiresIn: configService.getOrThrow(ConfigConstants.JWT_EXPIRATION),
        },
    }),
    inject: [ConfigService],
};
