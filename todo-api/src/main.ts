import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { OpenAPIUtil } from './utils/openapi.util';
import { ConfigConstants } from './constants/config.constants';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';
import { HttpExceptionsFilter } from './exception-filters/http-exceptions.filter';
import { swaggerConfig } from './config/swagger.config';
import { corsConfig } from './config/cors.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(logger, httpAdapter), new HttpExceptionsFilter(logger));
    app.useGlobalPipes(new ValidationPipe());

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow(ConfigConstants.PORT);

    await OpenAPIUtil.generateOpenAPIClient(document);

    app.enableCors(corsConfig);

    await app.listen(port);
}

bootstrap();
