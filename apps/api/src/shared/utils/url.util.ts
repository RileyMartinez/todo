import { ConfigConstants } from '@/shared/constants/config.constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlUtil {
    constructor(private readonly configService: ConfigService) {}

    getServerUrl(): string {
        const basePath = this.configService.getOrThrow<string>(ConfigConstants.BASE_PATH);
        const port = this.configService.getOrThrow<string>(ConfigConstants.PORT);

        if (basePath.includes('localhost')) {
            return `${basePath}:${port}`;
        } else {
            return basePath;
        }
    }

    getWebUrl(): string {
        const basePath = this.configService.getOrThrow<string>(ConfigConstants.BASE_PATH);
        const port = this.configService.getOrThrow<string>(ConfigConstants.WEB_PORT);

        if (basePath.includes('localhost')) {
            return `${basePath}:${port}`;
        } else {
            return basePath;
        }
    }

    getCallbackUrl(path = '/auth/callback'): string {
        return `${this.getWebUrl()}${path}`;
    }
}
