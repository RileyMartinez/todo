import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { UserMappingProfile } from 'src/common/mappers';
import { AuthModule } from '../auth/auth.module';
import { TodoListModule } from '../todolist/todo-list.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { typeOrmConfig, throttlerConfig, automapperConfig, loggerConfig } from 'src/common/configs';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards';
import { OpenAPIService } from 'src/common/services/openapi.service';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
        AutomapperModule.forRootAsync(automapperConfig),
        WinstonModule.forRootAsync(loggerConfig),
        TodoListModule,
        AuthModule,
        UsersModule,
        MessagingModule,
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
