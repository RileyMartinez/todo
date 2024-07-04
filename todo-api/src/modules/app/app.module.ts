import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { UserMappingProfile } from 'src/common/mappers';
import { AuthModule } from '../auth/auth.module';
import { TodoModule } from '../todo/todo.module';
import { TodolistModule } from '../todolist/todolist.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { OpenAPIService } from './providers';
import { TypeOrmConfig, ThrottlerConfig, AutomapperConfig, LoggerConfig } from 'src/common/configs';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(TypeOrmConfig),
        ThrottlerModule.forRootAsync(ThrottlerConfig),
        AutomapperModule.forRootAsync(AutomapperConfig),
        WinstonModule.forRootAsync(LoggerConfig),
        TodoModule,
        TodolistModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        UserMappingProfile,
        OpenAPIService,
    ],
})
export class AppModule {}
