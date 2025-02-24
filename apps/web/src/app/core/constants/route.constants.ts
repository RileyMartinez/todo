export class RouteConstants {
    // Web routes
    static readonly ROOT = '';
    static readonly AUTH = 'auth';
    static readonly TODO = 'todo';
    static readonly LOGIN = 'login';
    static readonly OTP_LOGIN = 'otp-login';
    static readonly OAUTH_CALLBACK = 'callback/:sub';
    static readonly LISTS = 'lists';
    static readonly LIST = 'list';
    static readonly WILDCARD = '**';

    // API routes
    static readonly AUTH_GOOGLE_LOGIN = 'auth/google/login';
}
