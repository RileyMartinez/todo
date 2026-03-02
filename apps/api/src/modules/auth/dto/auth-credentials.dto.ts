import { IsString, IsNotEmpty } from 'class-validator';

export class AuthCredentialsDto {
    /**
     * Email address
     * @example foo.bar@foobar.com
     */
    @IsString()
    @IsNotEmpty()
    email: string = '';

    /**
     * Password
     * @example fooBar123!
     */
    @IsString()
    @IsNotEmpty()
    password: string = '';
}
