import { RequestContext } from '@/common/context/request-context';
import { ApiErrorResponse, ValidationErrorDetail } from '@/common/dto/api-error-response.dto';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Specialized exception filter for validation errors produced by
 * `ValidationPipe` (which throws `BadRequestException`).
 *
 * Detects validation-specific `BadRequestException` responses and
 * formats the `validationErrors` array with per-field constraint details.
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationExceptionFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const correlationId = RequestContext.getCorrelationId() ?? 'unknown';

        const exceptionResponse = exception.getResponse() as Record<string, unknown>;

        // ValidationPipe produces { message: string[], error: string, statusCode: number }
        const messages = exceptionResponse.message;
        const isValidationError = Array.isArray(messages);

        let validationErrors: ValidationErrorDetail[] | undefined;
        let message: string;

        if (isValidationError) {
            validationErrors = this.extractValidationErrors(messages);
            message = 'Validation failed';
        } else {
            message = typeof messages === 'string' ? messages : exception.message;
        }

        this.logger.warn(
            {
                correlationId,
                method: request.method,
                url: request.url,
                statusCode: status,
                validationErrors,
            },
            message,
        );

        const body = new ApiErrorResponse(
            status,
            message,
            HttpStatus[status] ?? 'Bad Request',
            new Date().toISOString(),
            request.url,
            correlationId,
            validationErrors,
        );

        response.status(status).json(body);
    }

    /**
     * Extracts structured validation error details from the flat
     * string array produced by `ValidationPipe`.
     *
     * ValidationPipe messages follow the pattern:
     * "propertyName constraint message" (e.g., "email must be an email")
     */
    private extractValidationErrors(messages: string[]): ValidationErrorDetail[] {
        const fieldMap = new Map<string, Record<string, string>>();

        for (const msg of messages) {
            // Best-effort: first word is the field name
            const spaceIndex = msg.indexOf(' ');
            const field = spaceIndex > 0 ? msg.substring(0, spaceIndex) : 'unknown';
            const constraint = msg;

            const existing = fieldMap.get(field) ?? {};
            existing[constraint] = msg;
            fieldMap.set(field, existing);
        }

        return Array.from(fieldMap.entries()).map(
            ([field, constraints]) => new ValidationErrorDetail(field, constraints),
        );
    }
}
