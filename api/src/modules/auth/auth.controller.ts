import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
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
import { AccessTokenDto, AuthLoginDto, AuthRefreshDto, AuthTokenDto } from './dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
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
     * @param {AuthLoginDto} _ - The email and password of the user.
     * @returns {Promise<AccessTokenDto>} - A promise that resolves to the authentication tokens for the authenticated user.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    @Public()
    @Post('login')
    @ApiOkResponse({ type: AccessTokenDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(
        @GetCurrentUser() tokens: AuthTokenDto,
        @Body() _: AuthLoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenDto> {
        if (!tokens) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
    }

    @Public()
    @Post('one-time-login')
    @UseGuards(OtpGuard)
    @ApiOkResponse({ type: AccessTokenDto })
    @HttpCode(HttpStatus.OK)
    async oneTimeLogin(
        @GetCurrentUser() tokens: AuthTokenDto,
        @Body() _: AuthLoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenDto> {
        if (!tokens) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
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
        @GetCurrentUser(DecoratorConstants.SUB, ParseIntPipe) userId: number,
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
     * @param {AuthRegisterDto} authRegisterDto - The email and password of the user.
     * @returns {Promise<AccessTokenDto>} - A promise that resolves to the authentication tokens for the registered user.
     * @throws {ConflictException} - If a user with the provided email already exists.
     */
    @Public()
    @Post('register')
    @ApiCreatedResponse({ type: AccessTokenDto })
    @ApiConflictResponse({ description: ExceptionConstants.USER_ALREADY_EXISTS })
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() authRegisterDto: AuthRegisterDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenDto> {
        const tokens = await this.authService.register(authRegisterDto);
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
    }

    /**
     * Handles the refresh request.
     *
     * @param {number} userId - The ID of the user.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<AccessTokenDto>} - A promise that resolves to the new access token.
     * @throws {ForbiddenException} - If the user ID or refresh token is invalid.
     *
     * @remarks Needs [Public] decorator to bypass the JwtAuthGuard and use JwtRefreshGuard instead.
     */
    @Public()
    @Post('refresh')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AccessTokenDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @GetCurrentUser(DecoratorConstants.SUB, ParseIntPipe) userId: number,
        @GetCurrentUser(DecoratorConstants.REFRESH_TOKEN) refreshToken: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<AccessTokenDto> {
        if (!userId || !refreshToken) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        const tokens = await this.authService.refresh(new AuthRefreshDto(userId, refreshToken));
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
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
    @ApiOkResponse({ description: 'Password reset email event sent successfully if email exists.' })
    @HttpCode(HttpStatus.OK)
    async sendPasswordResetRequest(@Body('email') email: string): Promise<void> {
        return await this.authService.sendPasswordResetEvent(email);
    }
}
