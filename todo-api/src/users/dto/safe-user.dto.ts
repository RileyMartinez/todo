import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SafeUserDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    email: string;
}
