import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class UserContextDto {
    @IsString()
    @IsNotEmpty()
    sub: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    displayName: string | null;

    @IsBoolean()
    @IsNotEmpty()
    isVerified: boolean;

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

    static from(obj: any): UserContextDto {
        const className = obj?.constructor.name;

        switch (className) {
            case User.name:
                return new UserContextDto(obj.id, obj.email, obj.displayName, obj.isVerified, obj.avatar);
            default:
                throw new Error(`Unknown class type: ${className}`);
        }
    }
}
