import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
import { UserContextDto } from '@/modules/auth/dto/user-context.dto';

export class AuthRefreshResultDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @IsNotEmptyObject()
    userContext: UserContextDto;

    constructor(accessToken: string, userContext: UserContextDto) {
        this.accessToken = accessToken;
        this.userContext = userContext;
    }
}
