export interface OpenAPIGeneratorConfig {
    allowUnicodeIdentifiers?: boolean;
    apiModulePrefix?: string;
    configurationPrefix?: string;
    disallowAdditionalPropertiesIfNotPresent?: boolean;
    ensureUniqueParams?: boolean;
    enumNameSuffix?: string;
    enumPropertyNaming?: 'camelCase' | 'PascalCase' | 'snake_case' | 'UPPERCASE' | 'original';
    enumPropertyNamingReplaceSpecialChar?: boolean;
    enumUnknownDefaultCase?: boolean;
    fileNaming?: 'camelCase' | 'kebab-case';
    legacyDiscriminatorBehavior?: boolean;
    licenseName?: string;
    modelFileSuffix?: string;
    modelPropertyNaming?: 'camelCase' | 'PascalCase' | 'snake_case' | 'original';
    modelSuffix?: string;
    ngPackagrVersion?: string;
    ngVersion?: string;
    npmName: string; // Required
    npmRepository?: string;
    npmVersion?: string;
    nullSafeAdditionalProps?: boolean;
    paramNaming?: 'camelCase' | 'PascalCase' | 'snake_case' | 'original';
    prependFormOrBodyParameters?: boolean;
    providedIn?: 'root' | 'none' | 'any' | 'platform';
    queryParamObjectFormat?: 'dot' | 'json' | 'key';
    rxjsVersion?: string;
    serviceFileSuffix?: string;
    serviceSuffix?: string;
    snapshot?: boolean;
    sortModelPropertiesByRequiredFlag?: boolean;
    sortParamsByRequiredFlag?: boolean;
    stringEnums?: boolean;
    supportsES6?: boolean;
    taggedUnions?: boolean;
    tsVersion?: string;
    useSingleRequestParameter?: boolean;
    useSquareBracketsInArrayNames?: boolean;
    withInterfaces?: boolean;
    zonejsVersion?: string;
}

export const openAPIGeneratorConfig: OpenAPIGeneratorConfig = {
    npmName: '@repo/openapi-client',
    ngVersion: '19.0.0',
    fileNaming: 'kebab-case',
    serviceSuffix: 'Client',
    serviceFileSuffix: '.client',
    supportsES6: true,
};

export function getAdditionalPropertiesString(): string {
    return Object.entries(openAPIGeneratorConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
}
