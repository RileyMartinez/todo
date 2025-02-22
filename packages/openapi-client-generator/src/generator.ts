import { exec } from 'child_process';
import { rm } from 'fs/promises';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { getAdditionalPropertiesString, OpenAPIGeneratorConfig } from './config';

const execAsync = promisify(exec);

export async function generateClient(config: OpenAPIGeneratorConfig): Promise<void> {
    if (!config.outputDir) {
        throw new Error('outputDir is required');
    }

    if (config.postProcessingEnabled) {
        process.env.TS_POST_PROCESS_FILE = 'prettier --write';
    }

    const inputPath = join(dirname(__filename), 'openapi.json');
    const outputPath = join(process.cwd(), config.outputDir);

    try {
        await rm(outputPath, { recursive: true, force: true });

        const { stdout, stderr } = await execAsync(
            [
                'pnpm dlx @openapitools/openapi-generator-cli generate -g typescript-angular',
                `--enable-post-process-file`,
                `-i ${inputPath}`,
                `-o ${outputPath}`,
                `--additional-properties=${getAdditionalPropertiesString(config)}`,
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
