import { throttlerConfig } from '@/config/throttle.config';
import { typeOrmConfig } from '@/config/typeorm.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from '@/app.controller';
import { loggerConfig } from '@/config/logger.config';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { EmailModule } from '@/modules/email/email.module';
import { TodoListModule } from '@/modules/todo-list/todo-list.module';
import { UsersModule } from '@/modules/user/user.module';

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
