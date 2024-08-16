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
import { LocalGuard, JwtRefreshGuard } from './guards';
import { AccessTokenDto, AuthLoginDto, AuthRefreshDto, AuthTokenDto } from './dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { ConfigConstants, DecoratorConstants } from 'src/common/constants';
import { Response } from 'express';
import { InvalidTokenCookieConfig, RefreshTokenCookieConfig } from 'src/common/configs';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.authService = authService;
    }

    /**
     * Handles the login request.
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

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, RefreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
    }

    /**
     * Handles the logout request.
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

        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, '', InvalidTokenCookieConfig);

        return await this.authService.logout(userId);
    }

    /**
     * Handles the registration request.
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
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, RefreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
    }

    /**
     * Handles the refresh request.
     * Remarks: Needs Public decorator to bypass global JwtAuthGuard. JwtRefreshGuard is used instead.
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
        response.cookie(ConfigConstants.REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, RefreshTokenCookieConfig);

        return new AccessTokenDto(tokens.accessToken);
    }
}
