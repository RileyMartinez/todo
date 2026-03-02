import { UserContextDto } from '@/common/dto/user-context.dto';
import { AuthTokensDto } from '@/modules/auth/dto/auth-tokens.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class AuthResultDto {
    @ValidateNested()
    @Type(() => AuthTokensDto)
    @IsNotEmpty()
    tokens: AuthTokensDto;

    @ValidateNested()
    @Type(() => UserContextDto)
    @IsNotEmpty()
    userContext: UserContextDto;

    constructor(tokens: AuthTokensDto, userContext: UserContextDto) {
        this.tokens = tokens;
        this.userContext = userContext;
    }
}
