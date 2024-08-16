import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AuthRefreshDto {
    /**
     * User ID
     * @example 1
     */
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    userId: number = 0;

    /**
     * Refresh token
     * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvbyBCYXIiLCJpYXQiOjE1MTYyMzkwMjJ9.1Jf8
     */
    @IsString()
    @IsNotEmpty()
    refreshToken: string = '';

    constructor(userId: number, refreshToken: string) {
        this.userId = userId;
        this.refreshToken = refreshToken;
    }
}
