import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'User password',
        example: 'fooBar123!',
    })
    @IsString()
    @IsOptional()
    password?: string | undefined;

    @ApiProperty({
        description: 'User jwt refresh token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZvbyBCYXIiLCJpYXQiOjE1MTYyMzkwMjJ9.1Jf8',
    })
    @IsString()
    @IsOptional()
    refreshToken?: string | undefined;
}
