import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
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
import { AuthLoginDto, AuthRefreshDto, AuthTokenDto } from './dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { DecoratorConstants } from 'src/common/constants';

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
    @ApiOkResponse({ type: AuthTokenDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(@GetCurrentUser() tokens: AuthTokenDto, @Body() _: AuthLoginDto): Promise<AuthTokenDto> {
        if (!tokens) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return tokens;
    }

    /**
     * Handles the logout request.
     */
    @Post('logout')
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'User logged out successfully.' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @HttpCode(HttpStatus.OK)
    async logout(@GetCurrentUser(DecoratorConstants.SUB) userId: number): Promise<void> {
        if (!userId) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.authService.logout(userId);
    }

    /**
     * Handles the registration request.
     */
    @Public()
    @Post('register')
    @ApiCreatedResponse({ type: AuthTokenDto })
    @ApiConflictResponse({ description: ExceptionConstants.USER_ALREADY_EXISTS })
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        return await this.authService.register(authRegisterDto);
    }

    /**
     * Handles the refresh request.
     * Remarks: Needs Public decorator to bypass global JwtAuthGuard. JwtRefreshGuard is used instead.
     */
    @Public()
    @Post('refresh')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AuthTokenDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @GetCurrentUser(DecoratorConstants.SUB) userId: number,
        @GetCurrentUser(DecoratorConstants.REFRESH_TOKEN) refreshToken: string,
    ): Promise<AuthTokenDto> {
        if (!userId || !refreshToken) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.authService.refresh(new AuthRefreshDto(userId, refreshToken));
    }
}
