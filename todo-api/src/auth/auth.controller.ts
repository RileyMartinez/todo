import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LocalGuard } from './guards/local.guard';
import { Request } from 'express';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Req() req: Request) {
        return req.user;
    }

    @Post('logout')
    async logout() {
        return await this.authService.logout();
    }

    @Post('register')
    async register(@Body() authRegisterDto: AuthRegisterDto) {
        return await this.authService.register(authRegisterDto);
    }

    @Get('status')
    @UseGuards(JwtGuard)
    async status(@Req() req: Request) {
        return req.user;
    }
}
