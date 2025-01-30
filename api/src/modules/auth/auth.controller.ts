import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { OtpGuard, JwtRefreshGuard, LocalGuard, GoogleAuthGuard } from './guards';
import { AuthLoginRequestDto, AuthLoginResultDto, PasswordResetRequestDto, UserContextDto } from './dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { ConfigConstants, DecoratorConstants, SwaggerConstants } from 'src/common/constants';
import { CookieOptions, Response } from 'express';
import { cookieConfigFactory, invalidTokenCookieConfig } from 'src/common/configs';
import { ConfigService } from '@nestjs/config';
import { ValidationUtil } from '@/common';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    private readonly accessTokenCookieConfig: CookieOptions;
    private readonly refreshTokenCookieConfig: CookieOptions;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly validationUtil: ValidationUtil,
    ) {
        this.authService = authService;
        this.configService = configService;
        this.validationUtil = validationUtil;
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
        @GetCurrentUser() result: AuthLoginResultDto,
        @Body() _: AuthLoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        this.validationUtil.validateObject(result);

        const { tokens, userContext } = result;

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
        @GetCurrentUser() result: AuthLoginResultDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        this.validationUtil.validateObject(result);

        const { tokens, userContext } = result;
        const basePath = this.configService.getOrThrow<string>(ConfigConstants.BASE_PATH);
        const uiPort = this.configService.getOrThrow<string>(ConfigConstants.UI_PORT);

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, this.accessTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, this.refreshTokenCookieConfig);

        response.redirect(`${basePath}:${uiPort}/auth/callback/${userContext.sub}`);
    }

    @Public()
    @Post('one-time-login')
    @UseGuards(OtpGuard)
    @ApiOkResponse({ description: SwaggerConstants.USER_LOGIN_SUCCESS })
    @HttpCode(HttpStatus.OK)
    async oneTimeLogin(
        @GetCurrentUser() result: AuthLoginResultDto,
        @Body() _: AuthLoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<UserContextDto> {
        this.validationUtil.validateObject(result);

        const { tokens, userContext } = result;

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
    @ApiBearerAuth()
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

        response.cookie(ConfigConstants.ACCESS_TOKEN_COOKIE_NAME, '', invalidTokenCookieConfig);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, '', invalidTokenCookieConfig);

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
    @ApiBearerAuth()
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

    /**
     * [Public]
     * Handles the password reset request.
     *
     * @param {string} email - The email of the user.
     * @returns {Promise<void>} - A promise that resolves when the password reset request is sent.
     */
    @Public()
    @Post('send-password-reset')
    @ApiOkResponse({ description: 'Password reset request sent successfully.' })
    @HttpCode(HttpStatus.OK)
    async sendPasswordResetRequest(@Body() passwordResetRequestDto: PasswordResetRequestDto): Promise<void> {
        return await this.authService.sendPasswordResetEvent(passwordResetRequestDto.email);
    }
}
