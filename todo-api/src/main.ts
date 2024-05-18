import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConstants } from './app.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIUtil } from './utils/openapi.util';

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
    const basePath = configService.get(AppConstants.BASE_PATH);
    const port = configService.get(AppConstants.PORT);
    const uiPort = configService.get(AppConstants.UI_PORT);

    await OpenAPIUtil.generateOpenAPIClient(document);

    app.enableCors({
        origin: `${basePath}:${uiPort}`,
        credentials: true,
    });

    await app.listen(port);
}

bootstrap();
