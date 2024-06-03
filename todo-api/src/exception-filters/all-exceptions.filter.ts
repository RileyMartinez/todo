import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        // Add custom logging here for all exceptions
        // Consider using nest-winston: https://github.com/gremo/nest-winston

        super.catch(exception, host);
    }
}
