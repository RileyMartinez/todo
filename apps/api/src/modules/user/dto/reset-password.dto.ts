import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
    /**
     * New password — minimum 8 characters, at least one uppercase, one lowercase, one digit
     * @example NewPass123!
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'password must contain at least one uppercase letter, one lowercase letter, and one digit',
    })
    password: string = '';
}
