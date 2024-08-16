import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @IsString()
    @IsNotEmpty()
    email: string = '';

    /**
     * User password
     * @example fooBar123!
     */
    @IsString()
    @IsNotEmpty()
    password: string = '';
}
