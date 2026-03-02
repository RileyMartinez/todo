import { GetCurrentUser } from '@/common/decorators/get-current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { UserContextDto } from '@/common/dto/user-context.dto';
import { cookieConfigFactory } from '@/config/cookie.config-factory';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthCredentialsDto } from '@/modules/auth/dto/auth-credentials.dto';
import { AuthResultDto } from '@/modules/auth/dto/auth-result.dto';
import { DiscordAuthGuard } from '@/modules/auth/guards/discord-auth.guard';
import { FacebookAuthGuard } from '@/modules/auth/guards/facebook-auth.guard';
import { GitHubAuthGuard } from '@/modules/auth/guards/github-auth.guard';
import { GoogleAuthGuard } from '@/modules/auth/guards/google-auth.guard';
import { JwtRefreshGuard } from '@/modules/auth/guards/jwt-refresh.guard';
import { LocalGuard } from '@/modules/auth/guards/local.guard';
import { MicrosoftAuthGuard } from '@/modules/auth/guards/microsoft-auth.guard';
import { OtpGuard } from '@/modules/auth/guards/otp.guard';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { DecoratorConstants } from '@/shared/constants/decorator.constants';
import { ExceptionConstants } from '@/shared/constants/exception.constants';
import { SwaggerConstants } from '@/shared/constants/swagger.constants';
import { UrlUtil } from '@/shared/utils/url.util';
import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ApiConflictResponse,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiFoundResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    private readonly accessTokenCookieConfig: CookieOptions;
    private readonly refreshTokenCookieConfig: CookieOptions;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly urlUtil: UrlUtil,
    ) {
        this.accessTokenCookieConfig = cookieConfigFactory(this.configService, ConfigConstants.JWT_EXPIRATION);
        this.refreshTokenCookieConfig = cookieConfigFactory(this.configService, ConfigConstants.JWT_REFRESH_EXPIRATION);
    }

    /**
     * [Public]
     * Handles the login request.
     *
     * @param {AuthCredentialsDto} _ - The email and password of the user.
     * @returns {Promise<UserContextDto>} - A promise that resolves to the user context for the authenticated user.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    @Public()
    @Post('login')
    @ApiOkResponse({ type: UserContextDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(
        @GetCurrentUser() authResult: AuthResultDto,
        @Body() _: AuthCredentialsDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        const { tokens, userContext } = authResult;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        return userContext;
    }

    @Public()
    @Get('google/login')
    @UseGuards(GoogleAuthGuard)
    @HttpCode(HttpStatus.OK)
    googleLogin(): void {}

    @Public()
    @Get('google/redirect')
    @ApiFoundResponse({ description: 'Redirect to client with user session' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(GoogleAuthGuard)
    @HttpCode(HttpStatus.FOUND)
    googleRedirect(@GetCurrentUser() authResult: AuthResultDto, @Res({ passthrough: true }) response: Response): void {
        this.handleOAuthRedirect(authResult, response);
    }

    @Public()
    @Get('microsoft/login')
    @UseGuards(MicrosoftAuthGuard)
    @HttpCode(HttpStatus.OK)
    microsoftLogin(): void {}

    @Public()
    @Get('microsoft/redirect')
    @ApiFoundResponse({ description: 'Redirect to client with user session' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(MicrosoftAuthGuard)
    @HttpCode(HttpStatus.FOUND)
    microsoftRedirect(
        @GetCurrentUser() authResult: AuthResultDto,
        @Res({ passthrough: true }) response: Response,
    ): void {
        this.handleOAuthRedirect(authResult, response);
    }

    @Public()
    @Get('github/login')
    @UseGuards(GitHubAuthGuard)
    @HttpCode(HttpStatus.OK)
    githubLogin(): void {}

    @Public()
    @Get('github/redirect')
    @ApiFoundResponse({ description: 'Redirect to client with user session' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(GitHubAuthGuard)
    @HttpCode(HttpStatus.FOUND)
    githubRedirect(@GetCurrentUser() authResult: AuthResultDto, @Res({ passthrough: true }) response: Response): void {
        this.handleOAuthRedirect(authResult, response);
    }

    @Public()
    @Get('discord/login')
    @UseGuards(DiscordAuthGuard)
    @HttpCode(HttpStatus.OK)
    discordLogin(): void {}

    @Public()
    @Get('discord/redirect')
    @ApiFoundResponse({ description: 'Redirect to client with user session' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(DiscordAuthGuard)
    @HttpCode(HttpStatus.FOUND)
    discordRedirect(@GetCurrentUser() authResult: AuthResultDto, @Res({ passthrough: true }) response: Response): void {
        this.handleOAuthRedirect(authResult, response);
    }

    @Public()
    @Get('facebook/login')
    @UseGuards(FacebookAuthGuard)
    @HttpCode(HttpStatus.OK)
    facebookLogin(): void {}

    @Public()
    @Get('facebook/redirect')
    @ApiFoundResponse({ description: 'Redirect to client with user session' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(FacebookAuthGuard)
    @HttpCode(HttpStatus.FOUND)
    facebookRedirect(
        @GetCurrentUser() authResult: AuthResultDto,
        @Res({ passthrough: true }) response: Response,
    ): void {
        this.handleOAuthRedirect(authResult, response);
    }

    @Public()
    @Post('one-time-login')
    @UseGuards(OtpGuard)
    @ApiOkResponse({ description: SwaggerConstants.USER_LOGIN_SUCCESS })
    @HttpCode(HttpStatus.OK)
    async oneTimeLogin(
        @GetCurrentUser() authResult: AuthResultDto,
        @Body() _: AuthCredentialsDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        const { tokens, userContext } = authResult;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        return userContext;
    }

    /**
     * Handles the logout request.
     *
     * @param {number} userId - The ID of the user to log out.
     * @returns {Promise<void>} - A promise that resolves when the user is logged out.
     * @throws {ForbiddenException} - If the user ID is invalid.
     */
    @Post('logout')
    @ApiCookieAuth()
    @ApiOkResponse({ description: 'User logged out successfully.' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @HttpCode(HttpStatus.OK)
    async logout(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        if (!userId) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const defaultCookieConfig = cookieConfigFactory();
        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, '', defaultCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, '', defaultCookieConfig);

        await this.authService.logout(userId);
    }

    /**
     * [Public]
     * Handles the registration request.
     *
     * @param {AuthCredentialsDto} authCredentialsDto - The email and password of the user.
     * @returns {Promise<UserContextDto>} - A promise that resolves to the user context for the registered user.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    @Public()
    @Post('register')
    @ApiCreatedResponse({ description: 'User registered successfully.' })
    @ApiConflictResponse({ description: ExceptionConstants.USER_ALREADY_EXISTS })
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() authCredentialsDto: AuthCredentialsDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        const { tokens, userContext } = await this.authService.register(authCredentialsDto);

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        return userContext;
    }

    /**
     * Handles the refresh request.
     *
     * @param {number} userId - The ID of the user.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<AccessTokenResponseDto>} - A promise that resolves to the new access token.
     * @throws {ForbiddenException} - If the user ID or refresh token is invalid.
     *
     * @remarks Needs [Public] decorator to bypass the JwtAuthGuard and use JwtRefreshGuard instead.
     */
    @Public()
    @Post('refresh')
    @ApiCookieAuth()
    @ApiOkResponse({ type: UserContextDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @GetCurrentUser(DecoratorConstants.REFRESH_TOKEN) refreshToken: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        if (!userId || !refreshToken) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const { accessToken, userContext } = await this.authService.refresh(userId, refreshToken);
        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, accessToken, this.accessTokenCookieConfig);

        return userContext;
    }

    /**
     * Shared handler for all OAuth provider redirects.
     * Sets auth cookies and redirects the user to the client callback URL.
     */
    private handleOAuthRedirect(authResult: AuthResultDto, response: Response): void {
        const { tokens } = authResult;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(this.urlUtil.getCallbackUrl());
    }
}
