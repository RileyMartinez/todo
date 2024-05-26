import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';
import { JwtGuard } from './guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthTokenDto } from './dto/auth-token.dto';
import { AuthLoginDto } from './dto/auth-login.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
        this.authService = authService;
    }

    /**
     * Handles the login request.
     * @param req - The request object.
     * @returns A Promise that resolves to the authenticated user or undefined.
     */
    @Post('login')
    @UseGuards(LocalGuard)
    @ApiBody({
        description: 'Login credentials',
        type: CreateUserDto,
    })
    async login(@Req() req: Request, @Body() _: AuthLoginDto): Promise<AuthTokenDto> {
        return req.user as AuthTokenDto;
    }

    /**
     * Handles the logout request.
     * @returns A Promise that resolves to the result of the logout operation.
     */
    @Post('logout')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async logout() {
        return await this.authService.logout();
    }

    /**
     * Handles the registration request.
     * @param authRegisterDto - The DTO containing registration data.
     * @returns A Promise that resolves to the result of the registration operation.
     */
    @Post('register')
    async register(@Body() authRegisterDto: AuthRegisterDto): Promise<AuthTokenDto> {
        return await this.authService.register(authRegisterDto);
    }
}
