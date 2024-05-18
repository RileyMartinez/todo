import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LocalGuard } from './guards/local.guard';
import { Request, Response } from 'express';
import { JwtGuard } from './guards/jwt.guard';
import { InsertResult } from 'typeorm';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
    login(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): { status: string; message: string } {
        res.cookie('jwt', req.user, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 1),
        });

        return {
            status: 'success',
            message: 'Login successful',
        };
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
    async register(
        @Body() authRegisterDto: AuthRegisterDto,
    ): Promise<InsertResult | null> {
        return await this.authService.register(authRegisterDto);
    }
}
