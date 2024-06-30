// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ForbiddenException, Injectable } from '@nestjs/common';
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

    /**
     * Validates the email and password of a user.
     * @param email - The email of the user.
     * @param password - The password of the user.
     * @returns A promise that resolves to an AuthTokenDto.
     * @throws {ForbiddenException} - If the email or password is incorrect.
     */
    async validate(email: string, password: string): Promise<AuthTokenDto> {
        const user = await this.authService.login({
            email,
            password,
        });

        return user;
    }
}
