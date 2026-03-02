import { RequestContext } from '@/common/context/request-context';
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * In-memory request metric counters.
 *
 * This is a lightweight stub designed to be replaced with `prom-client`
 * histograms/counters once Prometheus scraping is configured.
 *
 * Shape matches Prometheus naming conventions:
 * - `http_requests_total`       — counter
 * - `http_request_duration_ms`  — histogram (recorded as individual values here)
 */
export interface RequestMetric {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    correlationId: string;
    timestamp: string;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    private readonly logger = new Logger(MetricsInterceptor.name);

    /**
     * Circular buffer of recent request metrics.
     * Kept small to avoid unbounded memory growth.
     * Replace with prom-client `Histogram` / `Counter` in production.
     */
    private readonly recentMetrics: RequestMetric[] = [];
    private readonly maxBufferSize = 1000;

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const startTime = performance.now();
        const httpCtx = context.switchToHttp();
        const request = httpCtx.getRequest<Request>();
        const response = httpCtx.getResponse<Response>();

        return next.handle().pipe(
            tap({
                next: () => this.recordMetric(request, response, startTime),
                error: () => this.recordMetric(request, response, startTime),
            }),
        );
    }

    /**
     * Returns a snapshot of recent metrics (useful for health/debug endpoints).
     */
    getRecentMetrics(): readonly RequestMetric[] {
        return this.recentMetrics;
    }

    private recordMetric(request: Request, response: Response, startTime: number): void {
        const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
        const correlationId = RequestContext.getCorrelationId() ?? 'unknown';

        const metric: RequestMetric = {
            method: request.method,
            path: request.route?.path ?? request.url,
            statusCode: response.statusCode,
            durationMs,
            correlationId,
            timestamp: new Date().toISOString(),
        };

        // Circular buffer — drop oldest when full
        if (this.recentMetrics.length >= this.maxBufferSize) {
            this.recentMetrics.shift();
        }
        this.recentMetrics.push(metric);

        // Log slow requests at warn level for Loki alerting
        if (durationMs > 1000) {
            this.logger.warn({ ...metric }, `Slow request: ${metric.method} ${metric.path} took ${durationMs}ms`);
        }
    }
}
