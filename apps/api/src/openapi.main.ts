import { AppModule } from '@/app.module';
import { createSwaggerDocument } from '@/config/swagger.config';
import { PathUtil } from '@/shared/utils/path.util';
import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as prettier from 'prettier';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        preview: true,
        abortOnError: false,
        logger: false,
    } as NestApplicationOptions);

    const document = createSwaggerDocument(app);

    const prettierConfig = await prettier.resolveConfig(process.cwd());
    const formattedDocument = await prettier.format(JSON.stringify(document), {
        ...prettierConfig,
        parser: 'json',
    } as prettier.Options);

    const inputPath = join(PathUtil.getWebPath(), 'openapi.json');
    await writeFile(inputPath, formattedDocument, { encoding: 'utf-8' });
}

bootstrap();
