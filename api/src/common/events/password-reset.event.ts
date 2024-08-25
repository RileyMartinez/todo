import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordResetEvent {
    /**
     * Email address
     * @example foo.bar@foobar.com
     */
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    token: string;

    constructor(email: string, token: string) {
        this.email = email;
        this.token = token;
    }
}
