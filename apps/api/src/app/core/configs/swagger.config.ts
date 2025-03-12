import { DocumentBuilder } from '@nestjs/swagger';
import { AppConstants } from '../constants/app.constants';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Todo List API with NestJS, TypeORM, and PostgreSQL')
    .setVersion('1.0')
    .addServer(AppConstants.SERVER_URL, 'Todo API Server')
    .addCookieAuth('accessToken', {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
    })
    .build();
