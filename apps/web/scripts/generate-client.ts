import { OpenAPIGeneratorConfig, generateClient } from '@repo/openapi-client-generator';

const config: OpenAPIGeneratorConfig = {
    ngVersion: '19.0.0',
    fileNaming: 'kebab-case',
    serviceSuffix: 'Client',
    serviceFileSuffix: '.client',
    supportsES6: true,
    postProcessingEnabled: true,
    outputDir: 'src/app/openapi-client',
};

generateClient(config);
