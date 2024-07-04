import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ExceptionConstants } from 'src/constants/exception.constants';
import { LocalGuard, JwtAccessGuard, JwtRefreshGuard } from './guards';
import { AuthLoginDto, AuthRefreshDto, AuthTokenDto } from './dto';
import { AuthRegisterDto } from './dto/auth-register.dto';

interface LoginRequest extends Express.Request {
    user?: AuthTokenDto;
}

interface LogOutRequest extends Express.Request {
    user?: {
        sub: number;
    };
}

interface RefreshRequest extends Express.Request {
    user?: {
        sub: number;
        refreshToken: string;
    };
}

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.authService = authService;
    }

    /**
     * Handles the login request.
     */
    @Post('login')
    @ApiOkResponse({ type: AuthTokenDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: LoginRequest, @Body() _: AuthLoginDto): Promise<AuthTokenDto> {
        if (!req.user) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return req.user;
    }

    /**
     * Handles the logout request.
     */
    @Post('logout')
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'User logged out successfully.' })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(JwtAccessGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: LogOutRequest): Promise<void> {
        if (!req.user || !req.user.sub) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.authService.logout(req.user.sub);
    }

    /**
     * Handles the registration request.
     */
    @Post('register')
    @ApiCreatedResponse({ type: AuthTokenDto })
    @ApiConflictResponse({ description: ExceptionConstants.USER_ALREADY_EXISTS })
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        return await this.authService.register(authRegisterDto);
    }

    /**
     * Handles the refresh request.
     */
    @Post('refresh')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AuthTokenDto })
    @ApiForbiddenResponse({ description: ExceptionConstants.INVALID_CREDENTIALS })
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: RefreshRequest): Promise<AuthTokenDto> {
        if (!req.user || !req.user.sub || !req.user.refreshToken) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.authService.refresh(new AuthRefreshDto(req.user.sub, req.user.refreshToken));
    }
}
