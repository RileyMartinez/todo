import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConstants } from './app.constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    const configService = app.get(ConfigService);
    const port = configService.get(AppConstants.PORT);

    await app.listen(port);
}

bootstrap();
