import { IsNotEmptyObject } from 'class-validator';
import { AuthTokensDto } from '@/modules/auth/dto/auth-tokens.dto';
import { UserContextDto } from '@/modules/auth/dto/user-context.dto';

export class AuthRegisterResultDto {
    @IsNotEmptyObject()
    tokens: AuthTokensDto;

    @IsNotEmptyObject()
    userContext: UserContextDto;

    constructor(tokens: AuthTokensDto, userContext: UserContextDto) {
        this.tokens = tokens;
        this.userContext = userContext;
    }
}
