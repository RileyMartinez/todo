import { eventEmitterConfig } from '@/common/configs/event-emitter.config';
import { loggerConfig } from '@/common/configs/logger.config';
import { throttlerConfig } from '@/common/configs/throttle.config';
import { typeOrmConfig } from '@/common/configs/typeorm.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailModule } from '../email/email.module';
import { TodoListModule } from '../todolist/todo-list.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
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
    ],
})
export class AppModule {}
