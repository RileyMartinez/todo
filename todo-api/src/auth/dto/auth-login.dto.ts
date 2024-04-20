import { IsString, IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
