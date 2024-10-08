import { IsString, IsNotEmpty } from 'class-validator';

export class AuthLoginRequestDto {
    /**
     * Login email address
     * @example foo.bar@foobar.com
     */
    @IsString()
    @IsNotEmpty()
    email: string = '';

    /**
     * Login password
     * @example fooBar123!
     */
    @IsString()
    @IsNotEmpty()
    password: string = '';
}
