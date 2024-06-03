import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'User email address',
        example: 'foo.bar@foobar.com',
    })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'fooBar123!',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
