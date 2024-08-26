import { IsNotEmpty, IsString } from 'class-validator';

export class AuthRefreshRequestDto {
    /**
     * User ID
     * @example 1
     */
    @IsString()
    @IsNotEmpty()
    userId: string = '';

    /**
     * Refresh token
     * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvbyBCYXIiLCJpYXQiOjE1MTYyMzkwMjJ9.1Jf8
     */
    @IsString()
    @IsNotEmpty()
    refreshToken: string = '';

    constructor(userId: string, refreshToken: string) {
        this.userId = userId;
        this.refreshToken = refreshToken;
    }
}
