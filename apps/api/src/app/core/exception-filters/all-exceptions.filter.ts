import { ArgumentsHost, Catch } from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';

/**
 * Global exception filter that catches all exceptions.
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    constructor(httpAdapter: AbstractHttpAdapter) {
        super(httpAdapter);
    }

    /**
     * Catches and logs the exception using Nest's underlying ExceptionHandler.
     * @param exception - The exception to be caught.
     * @param host - The arguments host object containing the request and response objects.
     * @todo Implement an injestion service to send the exception to a monitoring service.
     */
    catch(exception: unknown, host: ArgumentsHost) {
        /*
        if (exception instanceof Error) {
            Do something with exceptiion.message and exception.stack
        } else if (exception) {
            Do something with exception as a string (e.g. JSON.stringify(exception))
        }
        */
        super.catch(exception, host);
    }
}
