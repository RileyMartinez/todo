import { exec } from 'child_process';
import { promisify } from 'util';

export class OpenAPIUtil {
    static async generateOpenAPIClient(basePath: string) {
        const execAsync = promisify(exec);
        const outputPath = '../share/openapi-client';

        const { stdout, stderr } = await execAsync(
            [
                'npx openapi-generator-cli generate -g typescript-angular',
                `-i ${basePath}/api-json`,
                `-o ${outputPath}`,
                `--additional-properties=basePath=${basePath}`,
            ].join(' '),
            {
                encoding: 'utf-8',
            },
        );

        if (stdout) console.log('openapi-generator-cli-output:', stdout);
        if (stderr) console.error('openapi-generator-cli-error:', stderr);
    }
}
