import { Catch, ArgumentsHost, HttpException, ExceptionFilter, LoggerService } from '@nestjs/common';

/**
 * Custom exception filter for handling HTTP exceptions.
 */
@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {
        this.logger = logger;
    }

    /**
     * Handles the caught HTTP exception.
     * @param exception - The caught HTTP exception.
     * @param host - The arguments host containing the request and response objects.
     * @todo Implement an injestion service to send the exception to a monitoring service.
     */
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();

        this.logger.error(
            JSON.stringify({
                method: request.method,
                url: request.url,
                status: status,
                message: exception.message,
            }),
            exception.stack,
            HttpExceptionsFilter.name,
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
