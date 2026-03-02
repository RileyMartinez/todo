/**
 * Options for sending a templated email via SES.
 */
export interface TemplatedEmailOptions {
    /** Recipient email address. */
    readonly to: string;

    /** SES template name. */
    readonly templateName: string;

    /** Key-value data to interpolate into the template. */
    readonly templateData: Record<string, unknown>;
}
