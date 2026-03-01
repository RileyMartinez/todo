import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PasswordResetEmailDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    otp: number;

    constructor(email: string, otp: number) {
        this.email = email;
        this.otp = otp;
    }
}
