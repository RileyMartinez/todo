import { IsNotEmpty, IsString } from 'class-validator';

export class OtpTokenDto {
    @IsString()
    @IsNotEmpty()
    otp: number;

    constructor(otp: number) {
        this.otp = otp;
    }
}
