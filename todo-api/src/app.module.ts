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
import { AppConstants } from './app.constants';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync(typeOrmConfig),
        ThrottlerModule.forRootAsync(throttlerConfig),
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
    ],
})
export class AppModule {}
