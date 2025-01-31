import { AppConstants, ConfigConstants } from '@/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IOIDCStrategyOption, OIDCStrategy } from 'passport-azure-ad';
import { AuthService } from '../auth.service';
import { AuthLoginResultDto } from '../dto';

@Injectable()
export class AzureAdAuthStrategy extends PassportStrategy(OIDCStrategy, AppConstants.AZURE_AD_STRATEGY_NAME) {
    constructor(
        readonly configService: ConfigService,
        readonly authService: AuthService,
    ) {
        const tenantId = configService.getOrThrow(ConfigConstants.AZURE_AD_TENANT_ID);
        const clientId = configService.getOrThrow(ConfigConstants.AZURE_AD_CLIENT_ID);
        const baseUrl = configService.getOrThrow(ConfigConstants.BASE_PATH);
        const port = configService.getOrThrow(ConfigConstants.PORT);

        super({
            identityMetadata: `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`,
            clientID: clientId,
            audience: clientId,
            responseType: 'code id_token',
            responseMode: 'form_post',
            redirectUrl: `${baseUrl}:${port}/auth/${AppConstants.AZURE_AD_STRATEGY_NAME}/redirect`,
            allowHttpForRedirectUrl: true,
            clientSecret: configService.getOrThrow(ConfigConstants.AZURE_AD_CLIENT_SECRET),
            useCookieInsteadOfSession: true,
            cookieEncryptionKeys: [
                {
                    key: configService.getOrThrow(ConfigConstants.AZURE_AD_COOKIE_ENCRYPTION_KEY),
                    iv: configService.getOrThrow(ConfigConstants.AZURE_AD_COOKIE_IV),
                },
            ],
            scope: ['profile', 'email'],
        } as IOIDCStrategyOption);
    }

    async validate(profile: any, _done: any): Promise<AuthLoginResultDto> {
        return await this.authService.passwordlessLoginOrRegister(profile._json.email);
    }
}
