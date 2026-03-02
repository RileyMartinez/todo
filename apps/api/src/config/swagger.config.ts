import { ApiErrorResponse, ValidationErrorDetail } from '@/common/dto/api-error-response.dto';
import { ApiResponseMeta } from '@/common/dto/api-response.dto';
import { AppConstants } from '@/shared/constants/app.constants';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { description, name, version } from '../../package.json';

export const swaggerConfig = new DocumentBuilder()
    .setTitle(name)
    .setDescription(description)
    .setVersion(version)
    .addServer(AppConstants.SERVER_URL)
    .addCookieAuth('accessToken', {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
    })
    .build();

/**
 * Extra model classes that must appear in the OpenAPI `components/schemas`
 * section even if no controller directly references them via decorators.
 *
 * These are the standard API envelope types used by the global
 * `TransformInterceptor` and exception filters.
 *
 * Note: `ApiResponse<T>` is intentionally excluded — it is generic and
 * its schema is composed inline by the `ApiWrappedResponse` decorator.
 */
export const swaggerExtraModels = [ApiResponseMeta, ApiErrorResponse, ValidationErrorDetail];

/**
 * Creates the OpenAPI document with extra models registered.
 */
export function createSwaggerDocument(app: INestApplication) {
    return SwaggerModule.createDocument(app, swaggerConfig, {
        extraModels: swaggerExtraModels,
    });
}
