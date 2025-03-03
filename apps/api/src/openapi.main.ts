import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as prettier from 'prettier';
import { AppModule } from './app/app.module';
import { swaggerConfig } from './app/core/configs/swagger.config';
import { PathUtil } from './app/core/utils/path.util';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        preview: true,
        abortOnError: false,
        logger: false,
    } as NestApplicationOptions);

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const prettierConfig = await prettier.resolveConfig(process.cwd());
    const formattedDocument = await prettier.format(JSON.stringify(document), {
        ...prettierConfig,
        parser: 'json',
    } as prettier.Options);

    const inputPath = join(PathUtil.getWebPath(), 'openapi.json');
    await writeFile(inputPath, formattedDocument, { encoding: 'utf-8' });
}

bootstrap();
