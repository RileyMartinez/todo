import { exec } from 'child_process';
import * as os from 'os';
import { writeFile } from 'fs';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import axios from 'axios';
import { getAdditionalPropertiesString } from '../src/common/configs/openapi-generator.config';
import { config } from 'dotenv';

config();

const basePath = process.env.BASE_PATH;
const port = process.env.PORT;

if (!basePath) {
    throw new Error('BASE_PATH is not defined');
}

if (!port) {
    throw new Error('PORT is not defined');
}

const isWindows = os.platform() === 'win32';
const currentDir = isWindows ? '%cd%' : '$(pwd)';
const runCommand = `docker run --rm -v "${currentDir}:/local" openapitools/openapi-generator-cli:v7.5.0`;
const additionalProperties = getAdditionalPropertiesString(basePath, port);
const fetchPath = `${basePath}:${port}/api-json`;
const fileName = 'openapi.json';
const inputPath = `local/${fileName}`;
const outputPath = 'local/openapi-client';
const destinationPath = '../ui/src/app/openapi-client';

const writeFileAsync = promisify(writeFile);
const execAsync = promisify(exec);

const generateOpenAPIClient = async (fetchPath: string) => {
    try {
        if (!fetchPath) {
            throw new Error('fetchPath is required');
        }

        const spec = await fetchOpenApiSpec(fetchPath);
        await writeFileAsync(`./${fileName}`, spec);
        await generateClient();
        await moveClientToUiProject();
    } catch (error) {
        console.error('Error generating OpenAPI client:', error);
    }
};

async function fetchOpenApiSpec(fetchPath: string): Promise<string> {
    const response = await axios.get<string>(fetchPath, { responseType: 'text' });
    return response.data;
}

async function generateClient() {
    try {
        const { stdout, stderr } = await execAsync(
            [
                runCommand,
                'generate -g typescript-angular',
                `-i ${inputPath}`,
                `-o ${outputPath}`,
                `--additional-properties=${additionalProperties}`,
            ].join(' '),
            {
                encoding: 'utf8',
            },
        );

        if (stdout) {
            console.log('Generate OpenAPI client:', stdout);
        }

        if (stderr) {
            console.error('Error generating OpenAPI client:', stderr);
        }
    } catch (error) {
        console.error('Error generating OpenAPI client:', error);
    }
}

async function moveClientToUiProject() {
    const sourcePath = './openapi-client';

    if (!isWindows) {
        await execAsync(`sudo chmod 777 ${sourcePath}`);

        if (await fs.exists(destinationPath)) {
            await execAsync(`sudo rm -rf ${destinationPath}`);
        }
    }

    await fs.move(sourcePath, destinationPath, { overwrite: true });
}

generateOpenAPIClient(fetchPath);
