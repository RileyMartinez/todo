import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SafeUserDto {
    /**
     * User id
     * @example 1
     */
    @AutoMap()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    email: string;
}
