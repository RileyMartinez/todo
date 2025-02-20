import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('Todo List API with NestJS, TypeORM, and PostgreSQL')
    .setVersion('1.0')
    .addServer(`http://localhost:3000`, 'Local Development')
    .addServer(`https://todo-api.rileymartinez.com`, 'Production')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    })
    .build();
