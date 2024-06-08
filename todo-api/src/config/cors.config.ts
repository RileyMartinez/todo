import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { strict as assert } from 'assert';
import { config } from 'dotenv';

config();
const basePath = process.env.BASE_PATH;
const uiPort = process.env.UI_PORT;

assert(basePath, 'BASE_PATH is required');
assert(uiPort, 'UI_PORT is required');

export const corsConfig: CorsOptions = {
    origin: `${basePath}:${uiPort}`,
    credentials: true,
};
