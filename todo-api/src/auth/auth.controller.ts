import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() authLoginDto: AuthLoginDto): Promise<string | null> {
        const token = await this.authService.validateUser(authLoginDto);

        if (!token) {
            throw new HttpException(
                'Invalid credentials',
                HttpStatus.UNAUTHORIZED,
            );
        }

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
