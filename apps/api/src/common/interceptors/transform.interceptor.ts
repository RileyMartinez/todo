import { RequestContext } from '@/common/context/request-context';
import { ApiResponse, ApiResponseMeta } from '@/common/dto/api-response.dto';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

/**
 * Global interceptor that wraps all successful controller responses
 * into the standard `ApiResponse<T>` envelope.
 *
 * Controllers return the raw data value; this interceptor wraps it into:
 * ```json
 * { "data": T, "meta": { "timestamp", "correlationId", "path" } }
 * ```
 *
 * Skips wrapping when:
 * - Response headers have already been sent (e.g., streaming, SSE)
 * - Response data is `undefined` (void endpoints — returns `{ data: null, meta }`)
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        const httpCtx = context.switchToHttp();
        const request = httpCtx.getRequest<Request>();
        const response = httpCtx.getResponse<Response>();

        return next.handle().pipe(
            map((data) => {
                // Don't wrap if headers already sent (streaming/SSE)
                if (response.headersSent) {
                    return data as unknown as ApiResponse<T>;
                }

                const correlationId = RequestContext.getCorrelationId() ?? 'unknown';

                const meta = new ApiResponseMeta(new Date().toISOString(), correlationId, request.url);

                return new ApiResponse<T>(data === undefined ? (null as unknown as T) : data, meta);
            }),
        );
    }
}
