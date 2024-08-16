import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class SafeUserDto {
    /**
     * User id
     * @example 1
     */
    @AutoMap()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    id: number = 0;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    email: string = '';
}
