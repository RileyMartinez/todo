import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
    constructor(message: string = 'Database error', statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
        super(message, statusCode);
    }
}
