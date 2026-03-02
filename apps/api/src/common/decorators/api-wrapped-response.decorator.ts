import { ApiErrorResponse } from '@/common/dto/api-error-response.dto';
import { ApiResponseMeta } from '@/common/dto/api-response.dto';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, getSchemaPath, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';

interface ApiWrappedResponseOptions<T> {
    /** The DTO class representing the `data` property */
    type?: Type<T>;
    /** HTTP status code (default: 200) */
    status?: number;
    /** Swagger description */
    description?: string;
    /** Whether `data` is an array of `type` */
    isArray?: boolean;
}

/**
 * Custom Swagger decorator that documents the `ApiResponse<T>` envelope.
 *
 * Produces OpenAPI schema:
 * ```json
 * {
 *   "allOf": [
 *     { "$ref": "#/components/schemas/ApiResponse" },
 *     {
 *       "properties": {
 *         "data": { "$ref": "#/components/schemas/T" }
 *       }
 *     }
 *   ]
 * }
 * ```
 */
export function ApiWrappedResponse<T>(options: ApiWrappedResponseOptions<T> = {}) {
    const { type, status = HttpStatus.OK, description = 'Successful response', isArray = false } = options;

    const dataSchema = type
        ? isArray
            ? { type: 'array', items: { $ref: getSchemaPath(type) } }
            : { $ref: getSchemaPath(type) }
        : { nullable: true, example: null };

    const extraModels: Type[] = [ApiResponseMeta];
    if (type) {
        extraModels.push(type);
    }

    return applyDecorators(
        ApiExtraModels(...extraModels),
        SwaggerApiResponse({
            status,
            description,
            schema: {
                allOf: [
                    {
                        properties: {
                            data: dataSchema,
                            meta: { $ref: getSchemaPath(ApiResponseMeta) },
                        },
                        required: ['data', 'meta'],
                    },
                ],
            },
        }),
    );
}

/**
 * Shorthand for `@ApiWrappedResponse({ status: 201, ... })`
 */
export function ApiCreatedWrappedResponse<T>(options: Omit<ApiWrappedResponseOptions<T>, 'status'> = {}) {
    return ApiWrappedResponse({ ...options, status: HttpStatus.CREATED });
}

/**
 * Documents a standard error response in the OpenAPI spec.
 */
export function ApiErrorWrappedResponse(options: { status?: number; description?: string } = {}) {
    const { status = HttpStatus.BAD_REQUEST, description = 'Error response' } = options;

    return applyDecorators(
        ApiExtraModels(ApiErrorResponse),
        SwaggerApiResponse({
            status,
            description,
            schema: { $ref: getSchemaPath(ApiErrorResponse) },
        }),
    );
}
