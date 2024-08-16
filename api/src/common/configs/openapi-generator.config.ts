export const openAPIGeneratorConfig = {
    basePath: '${basePath}:${port}',
    fileNaming: 'kebab-case',
    serviceSuffix: 'Client',
    serviceFileSuffix: '.client',
    ngVersion: '17.3.10',
    supportsES6: 'true',
};

export function getAdditionalPropertiesString(basePath: string, port: string): string {
    return Object.entries(openAPIGeneratorConfig)
        .map(([key, value]) => {
            if (key === 'basePath') {
                return `${key}=${value.replace('${basePath}', basePath).replace('${port}', port)}`;
            }

            return `${key}=${value}`;
        })
        .join(',');
}
