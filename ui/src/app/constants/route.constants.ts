export class RouteConstants {
    // UI routes
    static readonly ROOT = '';
    static readonly LOGIN_OR_REGISTER = 'login-or-register';
    static readonly OTP_LOGIN = 'otp-login';
    static readonly OAUTH_CALLBACK = 'auth/callback/:sub';
    static readonly TODO_LISTS = 'todo-lists';
    static readonly TODO_LIST = 'todo-list';
    static readonly WILDCARD = '**';

    // API routes
    static readonly AUTH_GOOGLE_LOGIN = 'auth/google/login';
    static readonly AUTH_AZURE_AD_LOGIN = 'auth/azure-ad/login';
}
