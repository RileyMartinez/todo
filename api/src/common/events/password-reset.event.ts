import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordResetEvent {
    @IsString()
    @IsNotEmpty()
    token: string;

    constructor(token: string) {
        this.token = token;
    }
}
