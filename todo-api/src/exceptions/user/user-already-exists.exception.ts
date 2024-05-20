import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
    constructor(message: string = 'User already exists', statusCode: HttpStatus = HttpStatus.CONFLICT) {
        super(message, statusCode);
    }
}
