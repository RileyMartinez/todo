import { AppController } from '@/app.controller';
import { CoreModule } from '@/common/core.module';
import { CorrelationIdMiddleware } from '@/common/middleware/correlation-id.middleware';
import { loggerConfig } from '@/config/logger.config';
import { throttlerConfig } from '@/config/throttle.config';
import { typeOrmConfig } from '@/config/typeorm.config';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { EmailModule } from '@/modules/email/email.module';
import { TodoListModule } from '@/modules/todo-list/todo-list.module';
import { UsersModule } from '@/modules/user/user.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
        LoggerModule.forRootAsync(loggerConfig),
        CoreModule,
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    }
}
