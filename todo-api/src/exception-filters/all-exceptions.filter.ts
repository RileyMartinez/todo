import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        if (exception instanceof HttpException) {
            const ctx = host.switchToHttp();
            const request = ctx.getRequest();
            const status =
                exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

            this.logger.error(
                JSON.stringify({
                    method: request.method,
                    url: request.url,
                    status: status,
                    message: exception.message || 'Internal server error',
                }),
                exception.stack,
            );
        } else {
            this.logger.error(JSON.stringify(exception));
        }

        super.catch(exception, host);
    }
}
