export class ExceptionConstants {
    // static strings
    static readonly VALIDATION_FAILED = 'Validation failed';
    static readonly INVALID_CREDENTIALS = 'Invalid credentials';
    static readonly INTERNAL_SERVER_ERROR = 'Internal server error';
    static readonly INVALID_TOKEN = 'Invalid token';
    static readonly TOKEN_EXPIRED = 'Token expired';
    static readonly USER_ALREADY_EXISTS = 'User already exists';
    static readonly USER_NOT_FOUND = 'User not found';
    static readonly INVALID_USER_ID = 'User ID must be greater than 0';
    static readonly INVALID_EMAIL = 'Email must be provided';
    static readonly INVALID_TODO_LIST_ID = 'Todo list ID must be greater than 0';
    static readonly TODO_LIST_NOT_FOUND = 'Todo list not found';
    static readonly INVALID_TODO_ITEM_ID = 'Todo item ID must be greater than 0';
    static readonly TODO_ITEM_NOT_FOUND = 'Todo item not found';

    // dynamic strings
    static readonly invalidUserId = (id: number | undefined) => `User ID ${id} must be greater than 0`;
    static readonly userIdNotFound = (id: number | undefined) => `User with ID ${id} not found`;
    static readonly userEmailNotFound = (email: string | undefined) => `User with email ${email} not found`;
    static readonly invalidTodoListId = (id: number | undefined) => `Todo list ID ${id} must be greater than 0`;
}
