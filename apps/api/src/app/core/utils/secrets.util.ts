import { Client, createClient } from '@1password/sdk';
import { ClientConfiguration } from '@1password/sdk/dist/configuration';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { name, version } from '../../../../package.json';
import { ConfigConstants } from '../constants/config.constants';

@Injectable()
export class SecretsUtil {
    private client: Client | undefined;

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {
        this.logger = logger;
        this.configService = configService;
    }

    async getClient(): Promise<Client> {
        if (this.client) {
            return this.client;
        }

        this.client = await createClient({
            auth: this.configService.getOrThrow<string>(ConfigConstants.OP_SERVICE_ACCOUNT_TOKEN),
            integrationName: name,
            integrationVersion: version,
        } as ClientConfiguration);

        return this.client;
    }

    async getSecret<T>(secretReference: string): Promise<T> {
        const client = await this.getClient();
        const secret = await client.secrets.resolve(secretReference);

        return secret as T;
    }
}
