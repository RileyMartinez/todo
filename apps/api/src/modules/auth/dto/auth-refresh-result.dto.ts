import { UserContextDto } from '@/common/dto/user-context.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class AuthRefreshResultDto {
    /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... */
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ValidateNested()
    @Type(() => UserContextDto)
    @IsNotEmpty()
    userContext: UserContextDto;

    constructor(accessToken: string, userContext: UserContextDto) {
        this.accessToken = accessToken;
        this.userContext = userContext;
    }
}
