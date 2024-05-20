import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIUtil } from './utils/openapi.util';
import { ConfigConstants } from './constants/config.constants';

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
    // const basePath = configService.get(ConfigConstants.BASE_PATH);
    const port = configService.get(ConfigConstants.PORT);
    // const uiPort = configService.get(ConfigConstants.UI_PORT);

    await OpenAPIUtil.generateOpenAPIClient(document);
    /*
    app.enableCors({
        origin: `${basePath}:${uiPort}`,
        credentials: true,
    });
    */
    app.enableCors();

    await app.listen(port);
}

bootstrap();
