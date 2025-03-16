import { DocumentBuilder } from '@nestjs/swagger';
import { description, name, version } from '../../../../package.json';
import { AppConstants } from '../constants/app.constants';

export const swaggerConfig = new DocumentBuilder()
    .setTitle(name)
    .setDescription(description)
    .setVersion(version)
    .addServer(AppConstants.SERVER_URL)
    .addCookieAuth('accessToken', {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
    })
    .build();
