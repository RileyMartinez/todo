import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    constructor(email: string, password?: string, avatar?: string) {
        this.email = email;
        this.password = password;
        this.avatar = avatar;
    }
}
