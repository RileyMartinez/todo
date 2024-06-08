import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LocalGuard } from './guards/local.guard';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenDto } from './dto/auth-token.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ExceptionConstants } from 'src/constants/exception.constants';
import { Request } from 'express';

interface ExpressRequest extends Express.Request {
    user?: ExpressUser;
}

interface ExpressUser extends Express.User {
    sub?: number;
    accessToken?: string;
    refreshToken?: string;
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
    @ApiCreatedResponse({
        type: AuthTokenDto,
    })
    @ApiForbiddenResponse({
        description: ExceptionConstants.INVALID_CREDENTIALS,
    })
    @UseGuards(LocalGuard)
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: Request, @Body() _: AuthLoginDto): Promise<ExpressUser> {
        if (!req.user) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return req.user;
    }

    /**
     * Handles the logout request.
     */
    @Post('logout')
    @UseGuards(JwtAccessGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: ExpressRequest): Promise<void> {
        if (!req.user || !req.user.sub) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return await this.authService.logout(req.user.sub);
    }

    /**
     * Handles the registration request.
     */
    @Post('register')
    @ApiCreatedResponse({
        type: AuthTokenDto,
    })
    @ApiConflictResponse({
        description: ExceptionConstants.USER_ALREADY_EXISTS,
    })
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        return await this.authService.register(authRegisterDto);
    }
}
