import { IsNotEmptyObject } from 'class-validator';
import { UserContextDto } from './user-context.dto';
import { AuthTokensDto } from './auth-tokens.dto';

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
