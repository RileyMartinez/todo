import { IsNotEmptyObject } from 'class-validator';
import { AuthTokensDto, UserContextDto } from '.';

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
