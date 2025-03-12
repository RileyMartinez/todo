import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PasswordlessLoginDto } from '../../auth/dto/passwordless-login.dto';

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

    static from(obj: any): CreateUserDto {
        const classType = obj?.constructor.name;

        switch (classType) {
            case PasswordlessLoginDto.name:
                return new CreateUserDto(obj.email, undefined, obj.avatar);
            default:
                throw new Error(`Unknown class type: ${classType}`);
        }
    }
}
