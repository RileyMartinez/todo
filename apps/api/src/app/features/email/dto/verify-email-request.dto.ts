import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyEmailRequestDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    confirmationPin: number;

    constructor(email: string, confirmationPin: number) {
        this.email = email;
        this.confirmationPin = confirmationPin;
    }
}
