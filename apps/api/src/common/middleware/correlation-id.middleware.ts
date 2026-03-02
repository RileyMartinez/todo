import { RequestContext } from '@/common/context/request-context';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Middleware that ensures every request has a unique correlation ID.
 *
 * If the incoming request already has an `X-Correlation-Id` header, it is preserved.
 * Otherwise, a new UUID v4 is generated. The correlation ID is:
 * - Stored on the request object for downstream access
 * - Set as a response header so clients can reference it
 * - Propagated via AsyncLocalStorage so all log entries within the
 *   request lifecycle automatically include it
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || uuidv4();

        req.headers[CORRELATION_ID_HEADER] = correlationId;
        res.setHeader(CORRELATION_ID_HEADER, correlationId);

        RequestContext.run(
            {
                correlationId,
                method: req.method,
                url: req.originalUrl,
            },
            () => next(),
        );
    }
}
