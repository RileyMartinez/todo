import { IsNotEmpty, IsNumber } from 'class-validator';

export class OtpTokenPayloadDto {
    @IsNumber()
    @IsNotEmpty()
    otp: number;

    constructor(otp: number) {
        this.otp = otp;
    }
}
