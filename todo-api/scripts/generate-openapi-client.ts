import { execSync } from 'child_process';
import { rimraf } from 'rimraf';
import { config } from 'dotenv';

config();

const basePath = process.env.BASE_PATH || '';
const port = process.env.PORT || '3000';
const inputPath = `${basePath}:${port}/api-json`;
const outputPath = '../todo-ui/src/app/openapi-client';

rimraf.sync(outputPath);

const output = execSync(
    [
        'npx openapi-generator-cli generate -g typescript-angular',
        `-i ${inputPath}`,
        `-o ${outputPath}`,
        `--additional-properties=basePath=${basePath}:${port}`,
    ].join(' '),
    {
        encoding: 'utf-8',
    },
);

if (output) {
    console.log('openapi-generator-cli-output:', output);
}
