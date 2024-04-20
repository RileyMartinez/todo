import { IsNotEmpty, IsString } from 'class-validator';

export class AuthRegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
