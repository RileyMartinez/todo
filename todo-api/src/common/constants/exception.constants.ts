export class ExceptionConstants {
    // strings
    static readonly INVALID_CREDENTIALS = 'Invalid credentials';
    static readonly INTERNAL_SERVER_ERROR = 'Internal server error';
    static readonly INVALID_TOKEN = 'Invalid token';
    static readonly USER_ALREADY_EXISTS = 'User already exists';
    static readonly USER_NOT_FOUND = 'User not found';
    static readonly INVALID_USER_ID = 'User ID must be greater than 0';
    static readonly INVALID_EMAIL = 'Email must be provided';

    // functions
    static readonly UserNotFound = (id: string | number) => `User with ID ${id} not found`;
}
