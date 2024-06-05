import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { config } from 'dotenv';

config();
const basePath = process.env.BASE_PATH;
const uiPort = process.env.UI_PORT;

export const corsConfig: CorsOptions = {
    origin: `${basePath}:${uiPort}`,
    credentials: true,
};
