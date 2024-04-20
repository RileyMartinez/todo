import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

export class SafeUserDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    username: string;

    static createFromEntity(user: User): SafeUserDto {
        const safeUserDto: SafeUserDto = {
            id: user.id,
            username: user.username,
        };

        return safeUserDto;
    }
}
