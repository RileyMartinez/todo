import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsString } from 'class-validator';

export class SafeUserDto {
    /**
     * User id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    id: string = '';

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    email: string = '';
}
