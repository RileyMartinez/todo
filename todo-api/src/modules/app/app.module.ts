import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from '../todo/todo.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from '../../configs/typeorm.config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfig } from '../../configs/throttle.config';
import { AppConstants } from '../../constants/app.constants';
import { AutomapperModule } from '@automapper/nestjs';
import { automapperConfig } from '../../configs/automapper.config';
import { UserMappingProfile } from '../../mappers/user-mapping.profile';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from '../../configs/logger.config';
import { AppController } from './app.controller';
import { TodolistModule } from '../todolist/todolist.module';
import { OpenAPIService } from './providers/openapi.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
        AutomapperModule.forRootAsync(automapperConfig),
        WinstonModule.forRootAsync(loggerConfig),
        TodoModule,
        TodolistModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: AppConstants.APP_GUARD,
            useClass: ThrottlerGuard,
        },
        UserMappingProfile,
        OpenAPIService,
    ],
})
export class AppModule {}
