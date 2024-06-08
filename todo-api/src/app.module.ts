import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo/todo.module';
import { TodolistModule } from './todolist/todolist.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfig } from './config/throttle.config';
import { AppConstants } from './constants/app.constants';
import { AutomapperModule } from '@automapper/nestjs';
import { automapperConfig } from './config/automapper.config';
import { UserMappingProfile } from './mappers/user-mapping.profile';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';

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
        AppService,
        {
            provide: AppConstants.APP_GUARD,
            useClass: ThrottlerGuard,
        },
        UserMappingProfile,
    ],
})
export class AppModule {}
