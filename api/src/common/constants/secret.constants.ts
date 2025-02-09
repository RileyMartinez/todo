export class SecretConstants {
    private static readonly vaults = {
        dev: 'op://dev/todo-api',
        prod: 'op://prod/todo-api',
    } as const;

    private static getPath(env: 'dev' | 'prod', key: string): string {
        return `${this.vaults[env]}/${key}`;
    }
}
