import { execSync } from 'child_process';
import { rimraf } from 'rimraf';

const basePath = 'http://localhost:3000';
const inputPath = `${basePath}/api-json`;
const outputPath = '../todo-ui/src/app/openapi-client';

rimraf.sync(outputPath);

const output = execSync(
    [
        'npx openapi-generator-cli generate -g typescript-angular',
        `-i ${inputPath}`,
        `-o ${outputPath}`,
        `--additional-properties=basePath=${basePath}`,
    ].join(' '),
    {
        encoding: 'utf-8',
    },
);

if (output) {
    console.log('openapi-generator-cli-output:', output);
}
