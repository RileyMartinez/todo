import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        if (exception instanceof Error) {
            this.logger.error(exception.message, exception.stack);
        } else {
            this.logger.error(JSON.stringify(exception));
        }

        super.catch(exception, host);
    }
}
