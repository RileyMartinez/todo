import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { config } from 'dotenv';

config();
const basePath = process.env.BASE_PATH;
const uiPort = process.env.UI_PORT;

if (!basePath) {
    throw new Error('BASE_PATH is not defined');
}

if (!uiPort) {
    throw new Error('UI_PORT is not defined');
}

export const corsConfig: CorsOptions = {
    origin: [`${basePath}:${uiPort}`],
    credentials: true,
};
