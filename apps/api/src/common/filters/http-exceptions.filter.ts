import { RequestContext } from '@/common/context/request-context';
import { ApiErrorResponse } from '@/common/dto/api-error-response.dto';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Exception filter for all `HttpException` subclasses.
 *
 * Formats the response into the standard `ApiErrorResponse` envelope
 * and logs at the appropriate level:
 * - `warn` for 4xx client errors
 * - `error` for 5xx server errors
 */
@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionsFilter.name);

    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const correlationId = RequestContext.getCorrelationId() ?? 'unknown';

        const exceptionResponse = exception.getResponse();
        const message =
            typeof exceptionResponse === 'string'
                ? exceptionResponse
                : ((exceptionResponse as Record<string, unknown>).message?.toString() ?? exception.message);

        const errorName = HttpStatus[status] ?? 'Unknown Error';

        const logPayload = {
            correlationId,
            method: request.method,
            url: request.url,
            statusCode: status,
            message,
        };

        if (status >= 500) {
            this.logger.error(logPayload, exception.stack);
        } else {
            this.logger.warn(logPayload, message);
        }

        const body = new ApiErrorResponse(
            status,
            message,
            errorName,
            new Date().toISOString(),
            request.url,
            correlationId,
        );

        response.status(status).json(body);
    }
}
