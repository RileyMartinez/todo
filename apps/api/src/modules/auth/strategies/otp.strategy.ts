import { AuthService } from '@/modules/auth/auth.service';
import { AuthResultDto } from '@/modules/auth/dto/auth-result.dto';
import { AppConstants } from '@/shared/constants/app.constants';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy, AppConstants.OTP_STRATEGY_NAME) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
        } as IStrategyOptions);
    }

    /**
     * Validates the email and password of a user.
     * @param email - The email of the user.
     * @param password - The password of the user.
     * @returns A promise that resolves to an AuthResult.
     */
    async validate(email: string, password: string): Promise<AuthResultDto> {
        const user = await this.authService.oneTimeLogin({ email, password });
        return user;
    }
}
