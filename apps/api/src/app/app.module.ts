import { eventEmitterConfig } from '@/app/core/configs/event-emitter.config';
import { loggerConfig } from '@/app/core/configs/logger.config';
import { throttlerConfig } from '@/app/core/configs/throttle.config';
import { typeOrmConfig } from '@/app/core/configs/typeorm.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AuthModule } from './features/auth/auth.module';
import { JwtAuthGuard } from './features/auth/guards/jwt-auth.guard';
import { EmailModule } from './features/email/email.module';
import { TodoListModule } from './features/todolist/todo-list.module';
import { UsersModule } from './features/users/users.module';

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
