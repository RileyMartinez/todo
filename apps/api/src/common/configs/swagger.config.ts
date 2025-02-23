import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Todo List API with NestJS, TypeORM, and PostgreSQL')
    .setVersion('1.0')
    .addServer('todo.rileymartinez.com/api', 'Todo API Server')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    })
    .build();
