import { validate } from 'class-validator';
import { ValidationException } from 'src/common/exceptions/validation.exception';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ValidationUtil {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {
        this.logger = logger;
    }

    /**
     * Validates an object using class-validator library.
     * Throws a ValidationException if there are any validation errors.
     *
     * @param object - The object to be validated.
     * @returns A Promise that resolves to void.
     * @throws {ValidationException} If there are any validation errors.
     */
    async validateObject<T extends object>(object: T): Promise<void> {
        if (!object) {
            this.logger.error('Validation failed: object cannot be null or undefined');
            throw new ValidationException([
                { property: 'object', constraints: { isDefined: 'object cannot be null or undefined' } },
            ]);
        }

        const errors = await validate(object);
        if (errors.length > 0) {
            this.logger.error('Validation failed', errors);
            throw new ValidationException(errors);
        }
    }
}
