import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UserContextDto {
    @IsString()
    @IsNotEmpty()
    sub: string;

    @IsBoolean()
    @IsNotEmpty()
    isVerified: boolean;

    constructor(sub: string, isVerified: boolean) {
        this.sub = sub;
        this.isVerified = isVerified;
    }
}
