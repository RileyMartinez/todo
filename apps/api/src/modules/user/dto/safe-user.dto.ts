import { User } from '@/modules/user/entities/user.entity';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SafeUserDto {
    /**
     * User id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @IsUUID()
    @IsNotEmpty()
    id: string;

    /**
     * User display name
     * @example John Doe
     */
    @IsString()
    @IsOptional()
    displayName: string | null;

    /**
     * User email address
     * @example foo.bar@foobar.com
     */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /**
     * User verification status
     * @example true
     */
    @IsBoolean()
    @IsNotEmpty()
    isVerified: boolean;

    /**
     * User avatar
     * @example 'https://www.example.com/avatar.jpg'
     */
    @IsString()
    @IsOptional()
    avatar: string | null;

    constructor(user: User) {
        this.id = user.id;
        this.displayName = user.displayName;
        this.email = user.email;
        this.isVerified = user.isVerified;
        this.avatar = user.avatar;
    }
}
