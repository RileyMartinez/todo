import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SafeUserDto {
    @AutoMap()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @AutoMap()
    @IsString()
    @IsNotEmpty()
    email: string;
}
