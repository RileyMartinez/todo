import { AppConstants } from '@/app/core/constants/app.constants';
import { ConfigConstants } from '@/app/core/constants/config.constants';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { fromContainerMetadata, fromSSO } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class SESV2ClientFactory {
    private readonly region: string;
    private readonly profile: string;
    private readonly credentialProvider: AwsCredentialIdentityProvider;
    private client: SESv2Client;

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {
        this.logger = logger;
        this.configService = configService;
        this.region = this.configService.get(ConfigConstants.AWS_REGION) || AppConstants.DEFAULT_AWS_REGION;
        this.profile = this.configService.get(ConfigConstants.AWS_PROFILE) || AppConstants.DEFAULT_AWS_PROFILE;
        const env = this.configService.getOrThrow(ConfigConstants.APP_ENV);

        if (env === AppConstants.DEV) {
            this.credentialProvider = fromSSO({
                profile: this.profile,
            });
        } else {
            this.credentialProvider = fromContainerMetadata();
        }

        this.client = this.createClient();
    }

    createClient(region?: string): SESv2Client {
        const clientRegion = region ?? this.region;

        if (this.client?.config?.region === clientRegion) {
            return this.client;
        }

        this.logger.log(`Creating SES client for region: ${clientRegion}`, SESV2ClientFactory.name);

        this.client = new SESv2Client({
            region: clientRegion,
            credentials: this.credentialProvider,
        });

        return this.client;
    }
}
