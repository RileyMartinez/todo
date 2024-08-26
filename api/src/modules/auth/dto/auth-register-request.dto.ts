import { IsNotEmpty, IsString } from 'class-validator';

export class AuthRegisterRequestDto {
    /**
     * Registration email address
     * @example foo.bar@foobar.com
     */
    @IsString()
    @IsNotEmpty()
    email: string = '';

    /**
     * Registration password
     * @example fooBar123!
     */
    @IsString()
    @IsNotEmpty()
    password: string = '';
}
