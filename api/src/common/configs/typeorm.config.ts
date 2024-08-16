import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConstants } from 'src/common/constants/app.constants';
import { ConfigConstants } from 'src/common/constants/config.constants';

export const TypeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.getOrThrow(ConfigConstants.DB_HOST),
        port: configService.getOrThrow<number>(ConfigConstants.DB_PORT),
        username: configService.getOrThrow(ConfigConstants.DB_USERNAME),
        password: configService.getOrThrow(ConfigConstants.DB_PASSWORD),
        database: configService.getOrThrow(ConfigConstants.DB_NAME),
        synchronize: configService.getOrThrow(ConfigConstants.ENV) === AppConstants.DEV,
        autoLoadEntities: configService.getOrThrow<boolean>(ConfigConstants.DB_AUTOLOAD_ENTITIES),
    }),
    inject: [ConfigService],
};
