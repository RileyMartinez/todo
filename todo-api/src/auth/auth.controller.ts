import { Body, Controller, ForbiddenException, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';
import { JwtGuard } from './guards/jwt.guard';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { AuthTokenDto } from './dto/auth-token.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ExceptionConstants } from 'src/constants/exception.constants';

export interface AuthTokenRequest extends Request {
    user?: AuthTokenDto;
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
    async login(@Req() req: AuthTokenRequest, @Body() _: AuthLoginDto): Promise<AuthTokenDto> {
        if (!req.user) {
            throw new ForbiddenException(ExceptionConstants.INVALID_CREDENTIALS);
        }

        return req.user;
    }

    /**
     * Handles the logout request.
     */
    @Post('logout')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async logout() {
        return await this.authService.logout();
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
    async register(@Body() authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        return await this.authService.register(authRegisterDto);
    }
}
