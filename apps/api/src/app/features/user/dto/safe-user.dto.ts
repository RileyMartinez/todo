import { ExceptionConstants } from '@/app/core/constants/exception.constants';
import { BadRequestException } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

export class SafeUserDto {
    /**
     * User id
     * @example 'a1b2c3d4-1234-5678-90ab-cdef12345678'
     */
    @IsString()
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
    @IsString()
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

    constructor(user: User | null) {
        if (!user) {
            throw new BadRequestException(ExceptionConstants.INVALID_USER);
        }

        this.id = user.id;
        this.displayName = user.displayName;
        this.email = user.email;
        this.isVerified = user.isVerified;
        this.avatar = user.avatar;
    }
}
