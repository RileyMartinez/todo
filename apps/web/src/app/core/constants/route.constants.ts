export class RouteConstants {
    // Web routes
    static readonly ROOT = '';
    static readonly AUTH = 'auth';
    static readonly TODO = 'todo';
    static readonly LOGIN = 'login';
    static readonly OTP = 'otp';
    static readonly OAUTH_CALLBACK = 'callback/:sub';
    static readonly LISTS = 'lists';
    static readonly LIST = 'list';
    static readonly WILDCARD = '**';

    // API routes
    static readonly AUTH_GOOGLE_LOGIN = 'auth/google/login';
    static readonly AUTH_GITHUB_LOGIN = 'auth/github/login';
    static readonly AUTH_DISCORD_LOGIN = 'auth/discord/login';
    static readonly AUTH_FACEBOOK_LOGIN = 'auth/facebook/login';
    static readonly AUTH_MICROSOFT_LOGIN = 'auth/microsoft/login';
}
