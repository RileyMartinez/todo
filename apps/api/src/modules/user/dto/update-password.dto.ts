import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;

    constructor(currentPassword: string, newPassword: string, confirmPassword: string) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }
}
