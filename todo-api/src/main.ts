import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigConstants } from './constants/config.constants';
import { AllExceptionsFilter } from './exception-filters/all-exceptions.filter';
import { HttpExceptionsFilter } from './exception-filters/http-exceptions.filter';
import { swaggerConfig } from './configs/swagger.config';
import { corsConfig } from './configs/cors.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIService } from './modules/app/providers/openapi.service';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter), new HttpExceptionsFilter(logger));
    app.useGlobalPipes(new ValidationPipe());

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>(ConfigConstants.PORT);

    const openApiService = app.get(OpenAPIService);
    await openApiService.generateClient(document);

    app.enableCors(corsConfig);

    await app.listen(port);
}

bootstrap();
