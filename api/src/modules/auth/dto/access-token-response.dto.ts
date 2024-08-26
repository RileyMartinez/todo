import { IsNotEmpty, IsString } from 'class-validator';

export class AccessTokenResponseDto {
    /**
     * Access token
     * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     */
    @IsString()
    @IsNotEmpty()
    accessToken: string = '';

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }
}
