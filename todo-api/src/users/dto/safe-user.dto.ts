import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SafeUserDto {
    @ApiProperty({
        description: 'User id',
        example: 1,
    })
    @AutoMap()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: 'User email address',
        example: 'foo.bar@foobar.com',
    })
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    email: string;
}
