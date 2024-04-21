import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalGuard)
    async login(@Body() authLoginDto: AuthLoginDto): Promise<string | null> {
        const token = await this.authService.validate(authLoginDto);
        return token;
    }

    @Post('logout')
    async logout() {
        return await this.authService.logout();
    }

    @Post('register')
    async register(@Body() authRegisterDto: AuthRegisterDto) {
        return await this.authService.register(authRegisterDto);
    }
}
