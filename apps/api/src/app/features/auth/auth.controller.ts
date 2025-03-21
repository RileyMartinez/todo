import { cookieConfigFactory } from '@/app/core/configs/cookie.config-factory';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { DecoratorConstants } from '@/app/core/constants/decorator.constants';
import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { SwaggerConstants } from '@/app/core/constants/swagger.constants';
import { GetCurrentUser } from '@/app/core/decorators/get-current-user.decorator';
import { Public } from '@/app/core/decorators/public.decorator';
import { UrlUtil } from '@/app/core/utils/url.util';
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
} from '@nestjs/swagger';
import { validateOrReject } from 'class-validator';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthLoginRequestDto } from './dto/auth-login-request.dto';
import { AuthLoginResultDto } from './dto/auth-login-result.dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { UserContextDto } from './dto/user-context.dto';
import { DiscordAuthGuard } from './guards/discord-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalGuard } from './guards/local.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { OtpGuard } from './guards/otp.guard';

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
     * @param {AuthLoginRequestDto} _ - The email and password of the user.
     * @returns {Promise<AccessTokenResponseDto>} - A promise that resolves to the authentication tokens for the authenticated user.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    @Public()
    @Post('login')
    @ApiOkResponse({ type: UserContextDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Body() _: AuthLoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        await validateOrReject(authLoginResultDto);

        const { tokens, userContext } = authLoginResultDto;

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
    async googleRedirect(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await validateOrReject(authLoginResultDto);

        const { tokens, userContext } = authLoginResultDto;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(this.urlUtil.getCallbackUrl());
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
    async microsoftRedirect(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await validateOrReject(authLoginResultDto);

        const { tokens } = authLoginResultDto;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(this.urlUtil.getCallbackUrl());
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
    async githubRedirect(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await validateOrReject(authLoginResultDto);

        const { tokens } = authLoginResultDto;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(this.urlUtil.getCallbackUrl());
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
    async discordRedirect(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await validateOrReject(authLoginResultDto);

        const { tokens } = authLoginResultDto;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(this.urlUtil.getCallbackUrl());
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
    async facebookRedirect(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await validateOrReject(authLoginResultDto);

        const { tokens } = authLoginResultDto;

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(this.urlUtil.getCallbackUrl());
    }

    @Public()
    @Post('one-time-login')
    @UseGuards(OtpGuard)
    @ApiOkResponse({ description: SwaggerConstants.USER_LOGIN_SUCCESS })
    @HttpCode(HttpStatus.OK)
    async oneTimeLogin(
        @GetCurrentUser() authLoginResultDto: AuthLoginResultDto,
        @Body() _: AuthLoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        await validateOrReject(authLoginResultDto);

        const { tokens, userContext } = authLoginResultDto;

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
     * @param {AuthRegisterRequestDto} authRegisterRequestDto - The email and password of the user.
     * @returns {Promise<AccessTokenResponseDto>} - A promise that resolves to the authentication tokens for the registered user.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    @Public()
    @Post('register')
    @ApiCreatedResponse({ description: 'User registered successfully.' })
    @ApiConflictResponse({ description: ExceptionConstants.USER_ALREADY_EXISTS })
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() authRegisterRequestDto: AuthRegisterRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        const { tokens, userContext } = await this.authService.register(authRegisterRequestDto);

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

        const { accessToken, userContext } = await this.authService.refresh({ userId, refreshToken });
        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, accessToken, this.accessTokenCookieConfig);

        return userContext;
    }
}
