import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefreshTokenPayloadDto {
    @IsString()
    @IsNotEmpty()
    sub: string;

    @IsNumber()
    @IsNotEmpty()
    version: number;

    constructor(sub: string, version: number) {
        this.sub = sub;
        this.version = version;
    }
}
