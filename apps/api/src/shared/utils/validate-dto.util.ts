import { BadRequestException } from '@nestjs/common';
import { ValidationError, validateOrReject } from 'class-validator';

/**
 * Validates a DTO using `class-validator` and throws a `BadRequestException`
 * if validation fails, so the error is handled by `ValidationExceptionFilter`
 * instead of producing a raw 500.
 *
 * @param dto - The class instance to validate.
 * @throws {BadRequestException} When validation constraints are violated.
 */
export async function validateDto(dto: object): Promise<void> {
    try {
        await validateOrReject(dto);
    } catch (errors) {
        if (Array.isArray(errors) && errors.every((e) => e instanceof ValidationError)) {
            const messages = (errors as ValidationError[]).flatMap((error) => Object.values(error.constraints ?? {}));
            throw new BadRequestException(messages);
        }
        throw errors;
    }
}
