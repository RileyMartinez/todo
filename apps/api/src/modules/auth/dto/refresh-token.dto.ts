import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    sub: string;

    @IsNumber()
    @Min(1)
    version: number;

    constructor(sub: string, version: number) {
        this.sub = sub;
        this.version = version;
    }
}
