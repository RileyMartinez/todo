import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpExceptionsFilter } from '@/common/filters/http-exceptions.filter';
import { ValidationExceptionFilter } from '@/common/filters/validation-exception.filter';
import { MetricsInterceptor } from '@/common/interceptors/metrics.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { corsConfigFactory } from '@/config/cors.config-factory';
import { createSwaggerDocument } from '@/config/swagger.config';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

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
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));

    // Global interceptors — order: LoggerErrorInterceptor → MetricsInterceptor → TransformInterceptor
    app.useGlobalInterceptors(new LoggerErrorInterceptor(), new MetricsInterceptor(), new TransformInterceptor());

    // Global exception filters — registered broadest → narrowest
    // NestJS invokes the LAST matching filter, so order is: AllExceptions, HttpExceptions, Validation
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionsFilter(), new ValidationExceptionFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.use(cookieParser());

    const document = createSwaggerDocument(app);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>(ConfigConstants.PORT);

    app.enableCors(corsConfigFactory(configService));

    await app.listen(port);
}

bootstrap();
