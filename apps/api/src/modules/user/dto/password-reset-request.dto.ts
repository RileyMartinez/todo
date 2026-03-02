import { IsEmail } from 'class-validator';

export class PasswordResetRequestDto {
    /**
     * The email of the user.
     * @example foo.bar@foobar.com
     */
    @IsEmail()
    email: string = '';
}
