import { IsString, IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
