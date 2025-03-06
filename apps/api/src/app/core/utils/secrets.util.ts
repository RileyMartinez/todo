import { Client, createClient } from '@1password/sdk';
import { ClientConfiguration } from '@1password/sdk/dist/configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { name, version } from '../../../../package.json';
import { ConfigConstants } from '../constants/config.constants';

@Injectable()
export class SecretsUtil {
    private client: Client | undefined;

    constructor(private readonly configService: ConfigService) {
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
