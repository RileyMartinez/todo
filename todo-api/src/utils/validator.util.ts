import { validate } from 'class-validator';
import { ValidationException } from 'src/exceptions/validation.exception';

export class ValidatorUtil {
    /**
     * Validates an object using class-validator library.
     * Throws a ValidationException if there are any validation errors.
     *
     * @param object - The object to be validated.
     * @returns A Promise that resolves to void.
     * @throws {ValidationException} If there are any validation errors.
     */
    static async validate<T extends object>(object: T): Promise<void> {
        if (!object) {
            throw new ValidationException([
                { property: 'object', constraints: { isDefined: 'object cannot be null or undefined' } },
            ]);
        }

        const errors = await validate(object);
        if (errors.length > 0) {
            throw new ValidationException(errors);
        }
    }
}
