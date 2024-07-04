import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAPIObject } from '@nestjs/swagger';
import { ExecOptionsWithStringEncoding, exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { AppConstants } from 'src/common/constants/app.constants';
import { ConfigConstants } from 'src/common/constants/config.constants';
import { PathUtil } from 'src/utils/path.util';
import { promisify } from 'util';

@Injectable()
export class OpenAPIService {
    private readonly execAsync: (
        command: string,
        options: ExecOptionsWithStringEncoding,
    ) => Promise<{ stdout: string; stderr: string }>;

    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {
        this.logger = logger;
        this.configService = configService;
        this.execAsync = promisify(exec);
    }

    /**
     * Generates an OpenAPI client based on the provided OpenAPI document.
     * @param document The OpenAPI document.
     */
    async generateClient(document: OpenAPIObject) {
        const basePath = this.configService.getOrThrow(ConfigConstants.BASE_PATH);
        const port = this.configService.getOrThrow(ConfigConstants.PORT);
        const inputPath = join(PathUtil.getSharePath(), 'openapi.json');
        const outputPath = join(PathUtil.getSharePath(), 'openapi-client');
        const docString = JSON.stringify(document);

        await writeFile(inputPath, docString, { encoding: AppConstants.UTF8 });

        const { stdout, stderr } = await this.execAsync(
            [
                'npx openapi-generator-cli generate -g typescript-angular',
                `-i ${inputPath}`,
                `-o ${outputPath}`,
                `--additional-properties=basePath=${basePath}:${port}`,
            ].join(' '),
            { encoding: AppConstants.UTF8 },
        );

        if (stdout) {
            this.logger.log(`Generating OpenAPI client: ${stdout}`, OpenAPIService.name);
        }

        if (stderr) {
            this.logger.error(`Error generating OpenAPI client: ${stderr}`, OpenAPIService.name);
        }
    }
}
