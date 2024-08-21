import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { swaggerConfig, corsConfig } from './common/configs';
import { ConfigConstants } from './common/constants';
import { AllExceptionsFilter, HttpExceptionsFilter } from './common/exception-filters';
import * as cookieParser from 'cookie-parser';
import { OpenAPIService } from './common/services/openapi.service';

async function bootstrap() {
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

    const openApiService = app.get(OpenAPIService);
    await openApiService.generateClient(document);

    app.enableCors(corsConfig);

    await app.listen(port);
}

bootstrap();