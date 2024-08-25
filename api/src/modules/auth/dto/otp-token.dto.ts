import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class OtpTokenDto {
    @IsString()
    @IsNotEmpty()
    value: string;

    @IsDateString()
    @IsNotEmpty()
    expiration: Date;

    constructor(value: string, expiration: Date) {
        this.value = value;
        this.expiration = expiration;
    }
}
