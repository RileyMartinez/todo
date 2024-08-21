export class ExceptionConstants {
    // static strings
    static readonly INVALID_CREDENTIALS = 'Invalid credentials';
    static readonly INTERNAL_SERVER_ERROR = 'Internal server error';
    static readonly INVALID_TOKEN = 'Invalid token';
    static readonly USER_ALREADY_EXISTS = 'User already exists';
    static readonly USER_NOT_FOUND = 'User not found';
    static readonly INVALID_USER_ID = 'User ID must be greater than 0';
    static readonly INVALID_EMAIL = 'Email must be provided';
    static readonly INVALID_TODO_LIST_ID = 'Todo list ID must be greater than 0';

    // dynamic strings
    static readonly invalidUserId = (id: string | number | undefined) => `User ID ${id} must be greater than 0`;
    static readonly userNotFound = (id: string | number | undefined) => `User with ID ${id} not found`;
}
