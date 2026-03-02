import { RequestContext } from '@/common/context/request-context';
import { ApiErrorResponse } from '@/common/dto/api-error-response.dto';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global catch-all exception filter that handles any exception NOT
 * already caught by more specific filters (HttpExceptionsFilter,
 * ValidationExceptionFilter).
 *
 * Ensures:
 * - A generic 500 response is returned (never leaks internals)
 * - Full error details are logged server-side with correlation ID
 * - The correlation ID is included in the response for support tracing
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        // If this is actually an HttpException, let the HTTP filter handle it
        // (this filter runs as a fallback when registered in the correct order)
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const correlationId = RequestContext.getCorrelationId() ?? 'unknown';

        this.logger.error(
            {
                correlationId,
                method: request.method,
                url: request.url,
                statusCode: status,
                err: exception instanceof Error ? exception : undefined,
            },
            exception instanceof Error ? exception.message : 'Unexpected error',
        );

        const body = new ApiErrorResponse(
            status,
            'Internal server error',
            'Internal Server Error',
            new Date().toISOString(),
            request.url,
            correlationId,
        );

        response.status(status).json(body);
    }
}
