import { SESv2Client } from '@aws-sdk/client-sesv2';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppConstants, ConfigConstants } from 'src/common';

@Injectable()
export class SESV2ClientFactory {
    private readonly region: string;
    private client: SESv2Client;

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {
        this.logger = logger;
        this.configService = configService;
        this.region = this.configService.get(ConfigConstants.AWS_REGION) || AppConstants.DEFAULT_AWS_REGION;
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
            credentials: fromSSO(),
        });

        return this.client;
    }
}
