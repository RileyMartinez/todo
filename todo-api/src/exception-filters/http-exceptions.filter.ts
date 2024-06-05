import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionsFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();

        this.logger.error(
            JSON.stringify(
                {
                    method: request.method,
                    url: request.url,
                    status: status,
                    message: exception.message,
                },
                null,
                2,
            ),
            exception.stack,
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
