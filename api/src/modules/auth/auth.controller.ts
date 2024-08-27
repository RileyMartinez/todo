import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ExceptionConstants } from 'src/common/constants/exception.constants';
import { OtpGuard, JwtRefreshGuard, LocalGuard } from './guards';
import {
    AccessTokenResponseDto,
    AuthLoginRequestDto,
    AuthRefreshRequestDto,
    AuthTokensDto,
    PasswordResetRequestDto,
} from './dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { ConfigConstants, DecoratorConstants } from 'src/common/constants';
import { Response } from 'express';
import { invalidTokenCookieConfig, refreshTokenCookieConfig } from 'src/common/configs';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.authService = authService;
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
    @ApiOkResponse({ type: AccessTokenResponseDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(
        @GetCurrentUser() tokens: AuthTokensDto,
        @Body() _: AuthLoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenResponseDto> {
        if (!tokens) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenResponseDto(tokens.accessToken);
    }

    @Public()
    @Post('one-time-login')
    @UseGuards(OtpGuard)
    @ApiOkResponse({ type: AccessTokenResponseDto })
    @HttpCode(HttpStatus.OK)
    async oneTimeLogin(
        @GetCurrentUser() tokens: AuthTokensDto,
        @Body() _: AuthLoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenResponseDto> {
        if (!tokens) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenResponseDto(tokens.accessToken);
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

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, '', invalidTokenCookieConfig);

        return await this.authService.logout(userId);
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
    @ApiCreatedResponse({ type: AccessTokenResponseDto })
    @ApiConflictResponse({ description: ExceptionConstants.USER_ALREADY_EXISTS })
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() authRegisterRequestDto: AuthRegisterRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenResponseDto> {
        const tokens = await this.authService.register(authRegisterRequestDto);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenResponseDto(tokens.accessToken);
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
    @ApiOkResponse({ type: AccessTokenResponseDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @GetCurrentUser(DecoratorConstants.SUB) userId: string,
        @GetCurrentUser(DecoratorConstants.REFRESH_TOKEN) refreshToken: string,
    ): Promise<AccessTokenResponseDto> {
        if (!userId || !refreshToken) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.authService.refresh(new AuthRefreshRequestDto(userId, refreshToken));
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
    @HttpCode(HttpStatus.OK)
    async sendPasswordResetRequest(@Body() passwordResetRequestDto: PasswordResetRequestDto): Promise<void> {
        return await this.authService.sendPasswordResetEvent(passwordResetRequestDto.email);
    }
}
