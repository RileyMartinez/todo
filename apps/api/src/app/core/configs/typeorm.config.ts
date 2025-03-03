import { AppConstants } from '@/app/core/constants/app.constants';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.getOrThrow(ConfigConstants.DB_HOST),
        port: configService.getOrThrow<number>(ConfigConstants.DB_PORT),
        username: configService.getOrThrow(ConfigConstants.DB_USERNAME),
        password: configService.getOrThrow(ConfigConstants.DB_PASSWORD),
        database: configService.getOrThrow(ConfigConstants.DB_NAME),
        synchronize: process.env.APP_ENV === AppConstants.DEV,
        autoLoadEntities: configService.getOrThrow<boolean>(ConfigConstants.DB_AUTOLOAD_ENTITIES),
    }),
    inject: [ConfigService],
};
