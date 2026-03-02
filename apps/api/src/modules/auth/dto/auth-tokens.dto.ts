import { IsNotEmpty, IsString } from 'class-validator';

export class AuthTokensDto {
    /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... */
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... */
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
