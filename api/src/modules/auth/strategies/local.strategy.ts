import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { AppConstants } from '@/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AppConstants.LOCAL_STRATEGY_NAME) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
        } as IStrategyOptions);

        this.authService = authService;
    }

    /**
     * Validates the email and password of a user.
     * @param email - The email of the user.
     * @param password - The password of the user.
     * @returns A promise that resolves to an AuthTokenDto.
     */
    async validate(email: string, password: string): Promise<AuthTokensDto> {
        const user = await this.authService.login({
            email,
            password,
        });

        return user;
    }
}
