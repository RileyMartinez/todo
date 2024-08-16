import { join } from 'path';
import { AppConstants } from 'src/common/constants/app.constants';

/**
 * Utility class for working with file paths.
 */
export class PathUtil {
    /**
     * The relative root directory path.
     */
    private static readonly rootDirectoryPath = Array(4).fill('..').join('/');

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
    static getSharePath(): string {
        return join(__dirname, this.rootDirectoryPath, AppConstants.SHARE_DIRECTORY);
    }
}
