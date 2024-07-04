import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends HttpException {
    constructor(validationErrors: ValidationError[], message?: string) {
        super(
            {
                message: message || 'Validation failed',
                errors: validationErrors,
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}
