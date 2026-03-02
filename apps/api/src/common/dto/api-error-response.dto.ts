/**
 * Describes an individual validation constraint violation.
 */
export class ValidationErrorDetail {
    /** The DTO property that failed validation */
    field: string;

    /** Map of constraint name → human-readable message */
    constraints: Record<string, string>;

    constructor(field: string, constraints: Record<string, string>) {
        this.field = field;
        this.constraints = constraints;
    }
}

/**
 * Standard API error response envelope.
 *
 * All error responses (4xx/5xx) are formatted into this structure
 * by the global exception filters.
 *
 * @example
 * ```json
 * {
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "error": "Bad Request",
 *   "timestamp": "2025-01-01T00:00:00.000Z",
 *   "path": "/auth/register",
 *   "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *   "validationErrors": [
 *     {
 *       "field": "email",
 *       "constraints": { "isEmail": "email must be an email" }
 *     }
 *   ]
 * }
 * ```
 */
export class ApiErrorResponse {
    /** HTTP status code */
    statusCode: number;

    /** Human-readable error message */
    message: string;

    /** HTTP error name (e.g., "Bad Request", "Internal Server Error") */
    error: string;

    /** ISO-8601 timestamp */
    timestamp: string;

    /** Request path that produced the error */
    path: string;

    /** Unique correlation ID for request tracing */
    correlationId: string;

    /** Validation error details (only present for validation failures) */
    validationErrors?: ValidationErrorDetail[];

    constructor(
        statusCode: number,
        message: string,
        error: string,
        timestamp: string,
        path: string,
        correlationId: string,
        validationErrors?: ValidationErrorDetail[],
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.timestamp = timestamp;
        this.path = path;
        this.correlationId = correlationId;
        this.validationErrors = validationErrors;
    }
}
