import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { swaggerConfig, corsConfigFactory } from './common/configs';
import { ConfigConstants } from './common/constants';
import { AllExceptionsFilter, HttpExceptionsFilter } from './common/exception-filters';
import * as cookieParser from 'cookie-parser';
import { OpenAPIClientUtil } from './common/utils/openapi.util';
import { config } from 'dotenv';

/**
 * Bootstraps the application.
 *
 * This function initializes and starts the NestJS application.
 * It creates an instance of the NestExpressApplication, sets up the logger,
 * global filters, global pipes, and middleware.
 * It also generates the Swagger document and sets up the Swagger UI.
 * Finally, it enables CORS and starts listening on the specified port.
 *
 * @returns {Promise<void>} A promise that resolves when the application is successfully started.
 */
async function bootstrap(): Promise<void> {
    config();

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter), new HttpExceptionsFilter(logger));
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>(ConfigConstants.PORT);

    const openApiService = app.get(OpenAPIClientUtil);
    await openApiService.generateClient(document);

    app.enableCors(corsConfigFactory(configService));

    await app.listen(port);
}

bootstrap();
