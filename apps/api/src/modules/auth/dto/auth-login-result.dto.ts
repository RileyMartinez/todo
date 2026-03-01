import { IsNotEmptyObject } from 'class-validator';
import { UserContextDto } from '@/modules/auth/dto/user-context.dto';
import { AuthTokensDto } from '@/modules/auth/dto/auth-tokens.dto';

export class AuthLoginResultDto {
    @IsNotEmptyObject()
    tokens: AuthTokensDto;

    @IsNotEmptyObject()
    userContext: UserContextDto;

    constructor(tokens: AuthTokensDto, userContext: UserContextDto) {
        this.tokens = tokens;
        this.userContext = userContext;
    }
}
