import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class PasswordlessLoginDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @Matches(/^(https?:\/\/|data:image\/[a-z]+;base64,).*$/i, {
        message: 'Must be a valid URL or base64 image data',
    })
    @IsOptional()
    avatar?: string;

    constructor(email: string, avatar?: string) {
        this.email = email;
        this.avatar = avatar;
    }
}
