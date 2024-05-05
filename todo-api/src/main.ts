import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConstants } from './app.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigConstants } from './config/config.constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Todo API')
        .setDescription('Todo List API with NestJS, TypeORM, and PostgreSQL')
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        })
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.get(AppConstants.PORT);
    const env = configService.get(ConfigConstants.ENV);

    if (env === AppConstants.DEV) {
        app.enableCors();
    }

    await app.listen(port);
}

bootstrap();
