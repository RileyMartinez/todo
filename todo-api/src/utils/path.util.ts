import { join } from 'path';
import { AppConstants } from 'src/constants/app.constants';

export class PathUtil {
    private static readonly rootDirectoryPath = Array(4).fill('..').join('/');

    static getRootPath(): string {
        return join(__dirname, this.rootDirectoryPath);
    }

    static getSharePath(): string {
        return join(__dirname, this.rootDirectoryPath, AppConstants.SHARE_DIRECTORY);
    }
}
