import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    /**
     * Current password
     * @example OldPass123!
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    currentPassword: string;

    /**
     * New password — minimum 8 characters, at least one uppercase, one lowercase, one digit
     * @example NewPass123!
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'newPassword must contain at least one uppercase letter, one lowercase letter, and one digit',
    })
    newPassword: string;

    /**
     * Confirm new password — must match newPassword
     * @example NewPass123!
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'confirmPassword must contain at least one uppercase letter, one lowercase letter, and one digit',
    })
    confirmPassword: string;

    constructor(currentPassword: string, newPassword: string, confirmPassword: string) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }
}
