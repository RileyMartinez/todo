import { IsNotEmptyObject } from 'class-validator';
import { AuthTokensDto } from './auth-tokens.dto';
import { UserContextDto } from './user-context.dto';

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
