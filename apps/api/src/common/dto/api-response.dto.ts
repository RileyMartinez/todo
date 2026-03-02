/**
 * Standard API success response envelope.
 *
 * All successful API responses are wrapped in this structure by the
 * `TransformInterceptor`. Controllers return the raw `data` value;
 * the interceptor populates the envelope automatically.
 */
export class ApiResponseMeta {
    /** ISO-8601 timestamp of the response */
    timestamp: string;

    /** Unique correlation ID for request tracing */
    correlationId: string;

    /** Request path that produced this response */
    path: string;

    constructor(timestamp: string, correlationId: string, path: string) {
        this.timestamp = timestamp;
        this.correlationId = correlationId;
        this.path = path;
    }
}

/**
 * Generic API response wrapper.
 *
 * @example
 * ```json
 * {
 *   "data": { "id": "abc", "title": "My List" },
 *   "meta": {
 *     "timestamp": "2025-01-01T00:00:00.000Z",
 *     "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *     "path": "/todo-list"
 *   }
 * }
 * ```
 */
export class ApiResponse<T> {
    /** The response payload */
    data: T;

    /** Response metadata (timestamp, correlation ID, path) */
    meta: ApiResponseMeta;

    constructor(data: T, meta: ApiResponseMeta) {
        this.data = data;
        this.meta = meta;
    }
}
