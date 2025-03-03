import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app/app.module';
import { corsConfigFactory } from './app/core/configs/cors.config-factory';
import { swaggerConfig } from './app/core/configs/swagger.config';
import { ConfigConstants } from './app/core/constants/config.constants';
import { AllExceptionsFilter } from './app/core/exception-filters/all-exceptions.filter';
import { HttpExceptionsFilter } from './app/core/exception-filters/http-exceptions.filter';

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

    app.enableCors(corsConfigFactory(configService));

    await app.listen(port);
}

bootstrap();
