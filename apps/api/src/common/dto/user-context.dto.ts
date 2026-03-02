import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserContextDto {
    /** @example a1b2c3d4-1234-5678-90ab-cdef12345678 */
    @IsUUID()
    @IsNotEmpty()
    sub: string;

    /** @example foo.bar@foobar.com */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /** @example John Doe */
    @IsString()
    @IsOptional()
    displayName: string | null;

    /** @example true */
    @IsBoolean()
    @IsNotEmpty()
    isVerified: boolean;

    /** @example https://www.example.com/avatar.jpg */
    @IsString()
    @IsOptional()
    avatar: string | null;

    constructor(sub: string, email: string, displayName: string | null, isVerified: boolean, avatar: string | null) {
        this.sub = sub;
        this.email = email;
        this.displayName = displayName;
        this.isVerified = isVerified;
        this.avatar = avatar;
    }
}
