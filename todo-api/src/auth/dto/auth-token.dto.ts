import { IsNotEmpty, IsString } from 'class-validator';

export class AuthTokenDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
