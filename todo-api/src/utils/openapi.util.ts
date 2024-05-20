import { OpenAPIObject } from '@nestjs/swagger';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { config } from 'dotenv';

export class OpenAPIUtil {
    static async generateOpenAPIClient(swaggerDocument: OpenAPIObject) {
        config();
        const execAsync = promisify(exec);
        const swaggerFilePath = '../share/swagger.json';
        const outputPath = '../share/openapi-client';
        const basePath = process.env.BASE_PATH || '';
        const port = process.env.PORT || '3000';

        await writeFile(swaggerFilePath, JSON.stringify(swaggerDocument), 'utf8');

        const { stdout, stderr } = await execAsync(
            [
                'npx openapi-generator-cli generate -g typescript-angular',
                `-i ${swaggerFilePath}`,
                `-o ${outputPath}`,
                `--additional-properties=basePath=${basePath}:${port}`,
            ].join(' '),
            {
                encoding: 'utf-8',
            },
        );

        if (stdout) console.log('openapi-generator-cli-output:', stdout);
        if (stderr) console.error('openapi-generator-cli-error:', stderr);
    }
}
