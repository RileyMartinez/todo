import { join } from 'path';
import { AppConstants } from 'src/common/constants/app.constants';

/**
 * Utility class for working with file paths.
 */
export class PathUtil {
    /**
     * The relative root directory path.
     */
    private static readonly rootDirectoryPath = Array(6).fill('..').join('/');

    /**
     * Get the root path.
     * @returns The root path.
     */
    static getRootPath(): string {
        return join(__dirname, this.rootDirectoryPath);
    }

    /**
     * Get the share path.
     * @returns The share path.
     */
    static getPackagesPath(): string {
        return join(__dirname, this.rootDirectoryPath, AppConstants.PACKAGES_DIRECTORY);
    }

    /**
     * Get the openapi client generator src path.
     * @returns The openapi client generator path.
     */
    static getOpenapiClientGeneratorPath(): string {
        return join(this.getPackagesPath(), AppConstants.OPENAPI_CLIENT_GENERATOR_DIRECTORY, 'src');
    }
}
