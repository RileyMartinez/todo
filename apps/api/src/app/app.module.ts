import { throttlerConfig } from '@/app/core/configs/throttle.config';
import { typeOrmConfig } from '@/app/core/configs/typeorm.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { loggerConfig } from './core/configs/logger.config';
import { AuthModule } from './features/auth/auth.module';
import { JwtAuthGuard } from './features/auth/guards/jwt-auth.guard';
import { EmailModule } from './features/email/email.module';
import { TodoListModule } from './features/todo-list/todo-list.module';
import { UsersModule } from './features/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
        LoggerModule.forRootAsync(loggerConfig),
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
