import { AppConstants } from '@/app/core/constants/app.constants';
import { join } from 'path';

/**
 * Utility class for working with file paths.
 */
export class PathUtil {
    private static readonly rootDirectoryPath = Array(7).fill('..').join('/');
    private static readonly appsDirectoryPath = Array(6).fill('..').join('/');

    /**
     * Get the root path.
     * @returns Root directory path.
     */
    static getRootPath(): string {
        return join(__dirname, this.rootDirectoryPath);
    }

    /**
     * Get the apps workspace path.
     * @returns Apps directory path.
     */
    static getAppsPath(): string {
        return join(__dirname, this.appsDirectoryPath);
    }

    /**
     * Get the path to the web directory.
     * @returns Web directory path.
     */
    static getWebPath(): string {
        return join(this.getAppsPath(), AppConstants.WEB_DIRECTORY);
    }
}
