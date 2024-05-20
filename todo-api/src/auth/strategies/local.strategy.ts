import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthTokenDto } from '../dto/auth-token.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
        } as IStrategyOptions);

        this.authService = authService;
    }

    async validate(email: string, password: string): Promise<AuthTokenDto> {
        const user = await this.authService.login({
            email,
            password,
        });

        return user;
    }
}
