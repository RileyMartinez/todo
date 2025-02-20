import { exec } from 'child_process';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { getAdditionalPropertiesString } from './config';

const execAsync = promisify(exec);

export async function generateClient(): Promise<void> {
    process.env.TS_POST_PROCESS_FILE = 'prettier --write';

    const currentDir = dirname(__filename);
    const inputPath = join(currentDir, 'openapi.json');
    const outputPath = join(process.cwd(), 'src', 'app', 'openapi-client');

    try {
        const { stdout, stderr } = await execAsync(
            [
                'pnpm dlx @openapitools/openapi-generator-cli generate -g typescript-angular',
                `--enable-post-process-file`,
                `-i ${inputPath}`,
                `-o ${outputPath}`,
                `-p '../../.prettierrc'`,
                `--additional-properties=${getAdditionalPropertiesString()}`,
            ].join(' '),
            { encoding: 'utf-8' },
        );

        if (stdout) console.log('Generating OpenAPI client:', stdout);
        if (stderr) console.error('Error generating OpenAPI client:', stderr);
    } catch (error) {
        console.error('Failed to generate OpenAPI client:', error);
        throw error;
    }
}
