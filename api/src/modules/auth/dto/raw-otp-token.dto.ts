import { IsNotEmpty, IsString } from 'class-validator';

export class RawOtpTokenDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    otp: string;

    constructor(email: string, otp: string) {
        this.email = email;
        this.otp = otp;
    }
}
