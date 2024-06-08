import { ArgumentsHost, Catch, Inject, LoggerService } from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * Global exception filter that catches all exceptions and logs them using a logger service.
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        httpAdapter: AbstractHttpAdapter,
    ) {
        super(httpAdapter);
        this.logger = logger;
    }

    /**
     * Catches the exception and logs it using the logger service.
     * @param exception - The exception to be caught.
     * @param host - The arguments host object containing the request and response objects.
     * @todo Implement an injestion service to send the exception to a monitoring service.
     */
    catch(exception: unknown, host: ArgumentsHost) {
        if (exception instanceof Error) {
            this.logger.error(exception.message, exception.stack, AllExceptionsFilter.name);
        } else if (exception) {
            this.logger.error(JSON.stringify(exception), AllExceptionsFilter.name);
        }

        //
        super.catch(exception, host);
    }
}
