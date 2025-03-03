import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

export class SafeUserDto {
    /**
     * User id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @IsString()
    @IsNotEmpty()
    id: string = '';

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @IsString()
    @IsNotEmpty()
    email: string = '';

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
    }
}
