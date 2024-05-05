import { execSync } from 'child_process';
import { rimraf } from 'rimraf';

const generatePath = '../todo-ui/src/app/openapi-client';

rimraf.sync(generatePath);

const output = execSync(
    `npx openapi-generator-cli generate -g typescript-angular -i http://localhost:3000/api-json -o ${generatePath}`,
    { encoding: 'utf-8' },
);

console.log(output);
