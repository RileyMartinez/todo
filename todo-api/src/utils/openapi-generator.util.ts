import { OpenAPIObject } from '@nestjs/swagger';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { config } from 'dotenv';
import { PathLike } from 'fs';

export class OpenAPIGenerator {
    static async generateClient(swaggerDocument: OpenAPIObject) {
        try {
            config();
            const execAsync = promisify(exec);

            const swaggerFilePath: PathLike = '../share/swagger.json';
            const swaggerDocString: string = JSON.stringify(swaggerDocument);
            const outputPath = '../share/openapi-client';
            const basePath = process.env.BASE_PATH || '';
            const port = process.env.PORT || '3000';

            await writeFile(swaggerFilePath, swaggerDocString, { encoding: 'utf8' });

            const { stdout, stderr } = await execAsync(
                [
                    'npx openapi-generator-cli generate -g typescript-angular',
                    `-i ${swaggerFilePath}`,
                    `-o ${outputPath}`,
                    `--additional-properties=basePath=${basePath}:${port}`,
                ].join(' '),
                { encoding: 'utf8' },
            );

            if (stdout) {
                console.log('Generating OpenAPI client:', stdout);
            }

            if (stderr) {
                console.error('Error generating OpenApi client:', stderr);
            }
        } catch (error) {
            console.error('Error generating OpenAPI client:', error);
        }
    }
}
