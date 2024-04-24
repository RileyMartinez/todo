import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigConstants } from './config.constants';
import { AppConstants } from 'src/app.constants';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (
        configService: ConfigService,
    ): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.get(ConfigConstants.DB_HOST),
        port: configService.get(ConfigConstants.DB_PORT),
        username: configService.get(ConfigConstants.DB_USERNAME),
        password: configService.get(ConfigConstants.DB_PASSWORD),
        database: configService.get(ConfigConstants.DB_NAME),
        synchronize:
            configService.get(ConfigConstants.ENV) === AppConstants.DEV,
        autoLoadEntities: configService.get(
            ConfigConstants.DB_AUTOLOAD_ENTITIES,
        ),
    }),
    inject: [ConfigService],
};
