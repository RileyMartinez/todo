import { execSync } from 'child_process';
import { config } from 'dotenv';
import * as os from 'os';
import { writeFile } from 'fs';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import axios from 'axios';

config();

const isWindows = os.platform() === 'win32';
const currentDir = isWindows ? '%cd%' : '$(pwd)';
const runCommand = `docker run --rm -v "${currentDir}:/local" openapitools/openapi-generator-cli:latest-release`;
const basePath = process.env.BASE_PATH || '';
const port = process.env.PORT || '3000';
const fetchPath = `${basePath}:${port}/api-json`;
const fileName = 'openapi.json';
const inputPath = `local/${fileName}`;
const outputPath = 'local/openapi-client';
const destinationPath = '../todo-ui/src/app/openapi-client';
const writeFileAsync = promisify(writeFile);

const generateOpenAPIClient = async (fetchPath: string) => {
    try {
        const spec = await fetchOpenApiSpec(fetchPath);
        await writeFileAsync(`./${fileName}`, spec);
        generateClient();
        moveClientToUiProject();
    } catch (error) {
        console.error('Error generating OpenAPI client:', error);
    }
};

async function fetchOpenApiSpec(fetchPath: string): Promise<string> {
    const response = await axios.get<string>(fetchPath, { responseType: 'text' });
    return response.data;
}

function generateClient() {
    const output = execSync(
        [
            runCommand,
            'generate -g typescript-angular',
            `-i ${inputPath}`,
            `-o ${outputPath}`,
            `--additional-properties=basePath=${basePath}:${port}`,
        ].join(' '),
        {
            encoding: 'utf-8',
        },
    );

    if (output) {
        console.log('Generate OpenAPI client:', output);
    }
}

async function moveClientToUiProject() {
    const sourcePath = './openapi-client';

    if (!isWindows) {
        execSync(`sudo chmod 777 ${sourcePath}`);

        if (await fs.exists(destinationPath)) {
            execSync(`sudo rm -rf ${destinationPath}`);
        }
    }

    await fs.move(sourcePath, destinationPath, { overwrite: true });
}

generateOpenAPIClient(fetchPath);
