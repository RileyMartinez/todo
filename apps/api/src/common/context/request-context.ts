import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextData {
    /** Unique request correlation ID for distributed tracing */
    correlationId: string;
    /** Authenticated user ID, if available */
    userId?: string;
    /** HTTP method */
    method?: string;
    /** Request URL */
    url?: string;
    /** OpenTelemetry trace ID — populated when OTel SDK is integrated */
    traceId?: string;
    /** OpenTelemetry span ID — populated when OTel SDK is integrated */
    spanId?: string;
}

/**
 * AsyncLocalStorage-based request context for propagating
 * correlation IDs and request metadata across async boundaries.
 *
 * This enables structured logging with request context in services,
 * event handlers, and other code that runs outside the HTTP request scope.
 */
export class RequestContext {
    private static readonly storage = new AsyncLocalStorage<RequestContextData>();

    static run<T>(data: RequestContextData, fn: () => T): T {
        return this.storage.run(data, fn);
    }

    static get(): RequestContextData | undefined {
        return this.storage.getStore();
    }

    static getCorrelationId(): string | undefined {
        return this.storage.getStore()?.correlationId;
    }

    static getUserId(): string | undefined {
        return this.storage.getStore()?.userId;
    }

    static setUserId(userId: string): void {
        const store = this.storage.getStore();
        if (store) {
            store.userId = userId;
        }
    }
}
