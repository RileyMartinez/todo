import { ExecOptionsWithStringEncoding, exec } from 'child_process';
import { config } from 'dotenv';
import * as os from 'os';
import { writeFile } from 'fs';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import axios from 'axios';

// Load environment variables
config();

// Constants
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

// Promisify functions
const writeFileAsync = promisify(writeFile);
const execAsync = promisify(exec);

const generateOpenAPIClient = async (fetchPath: string) => {
    try {
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
        const execOptions: ExecOptionsWithStringEncoding = { encoding: 'utf8' };
        const { stdout, stderr } = await execAsync(
            [
                runCommand,
                'generate -g typescript-angular',
                `-i ${inputPath}`,
                `-o ${outputPath}`,
                `--additional-properties=basePath=${basePath}:${port}`,
            ].join(' '),
            execOptions,
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

    const moveOptions: fs.MoveOptions = { overwrite: true };
    await fs.move(sourcePath, destinationPath, moveOptions);
}

generateOpenAPIClient(fetchPath);
