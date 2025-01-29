import { IsNotEmpty, IsString } from 'class-validator';

export class UserContextDto {
    @IsString()
    @IsNotEmpty()
    sub: string;

    constructor(sub: string) {
        this.sub = sub;
    }
}
