import { DocumentBuilder } from '@nestjs/swagger';

export const SwaggerConfig = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Todo List API with NestJS, TypeORM, and PostgreSQL')
    .setVersion('1.0')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    })
    .build();
