import { IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyUserRequestDto {
    @IsNumber()
    @IsNotEmpty()
    verificationCode: number;

    constructor(verificationCode: number) {
        this.verificationCode = verificationCode;
    }
}
