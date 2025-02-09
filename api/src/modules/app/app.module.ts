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
import { typeOrmConfig, throttlerConfig, automapperConfig, loggerConfig, eventEmitterConfig } from 'src/common/configs';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards';
import { EmailModule } from '../email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OpenAPIClientUtil } from '@/common';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
        AutomapperModule.forRootAsync(automapperConfig),
        WinstonModule.forRootAsync(loggerConfig),
        EventEmitterModule.forRoot(eventEmitterConfig),
        TodoListModule,
        AuthModule,
        UsersModule,
        EmailModule,
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
        OpenAPIClientUtil,
    ],
})
export class AppModule {}
