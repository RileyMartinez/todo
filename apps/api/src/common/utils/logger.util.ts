export function formatLogMessage(tag: string, message: string, data?: any): string {
    const logObject: any = { tag, message };
    if (data) {
        logObject.data = data;
    }
    return JSON.stringify(logObject);
}
