export class AppConstants {
    static readonly DEV = 'dev';
    static readonly PROD = 'prod';
    static readonly UTF8 = 'utf8';
    static readonly WEB_DIRECTORY = 'web';
    static readonly JWT_STRATEGY_NAME = 'jwt';
    static readonly JWT_REFRESH_STRATEGY_NAME = 'jwt-refresh';
    static readonly LOCAL_STRATEGY_NAME = 'local';
    static readonly OTP_STRATEGY_NAME = 'otp';
    static readonly GOOGLE_STRATEGY_NAME = 'google';
    static readonly GITHUB_STRATEGY_NAME = 'github';
    static readonly DISCORD_STRATEGY_NAME = 'discord';
    static readonly FACEBOOK_STRATEGY_NAME = 'facebook';
    static readonly MICROSOFT_STRATEGY_NAME = 'microsoft';
    static readonly DEFAULT_AWS_REGION = 'us-east-1';
    static readonly DEFAULT_AWS_PROFILE = 'default';
    static readonly BASE_PATH = process.env.BASE_PATH || 'http://localhost';
    static readonly PORT = process.env.PORT || 3000;
    static readonly SERVER_URL =
        process.env.APP_ENV === AppConstants.DEV
            ? `${AppConstants.BASE_PATH}:${AppConstants.PORT}`
            : AppConstants.BASE_PATH;
}
