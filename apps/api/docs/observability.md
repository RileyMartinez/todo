# Observability Architecture

This document describes the logging, tracing, and metrics infrastructure for the Todo API and how it integrates with the Grafana observability stack (Loki, Tempo, Prometheus).

---

## 1. Structured Logging (→ Grafana Loki)

### Log Format

All logs are emitted as **JSON** via [Pino](https://github.com/pinojs/pino) through the `nestjs-pino` integration. In development mode, `pino-pretty` is used for human-readable output.

Every log line includes these fields:

| Field           | Source                        | Loki Label? | Description                                   |
| --------------- | ----------------------------- | ----------- | --------------------------------------------- |
| `level`         | Pino                          | ✅ Yes      | Log level as string (`info`, `warn`, `error`) |
| `service`       | `mixin` → `package.json#name` | ✅ Yes      | Service name (e.g., `api`)                    |
| `environment`   | `mixin` → `APP_ENV`           | ✅ Yes      | Deployment environment (`dev`, `prod`)        |
| `correlationId` | `mixin` → `RequestContext`    | ✅ Yes      | Unique request correlation ID (UUID v4)       |
| `userId`        | `mixin` → `RequestContext`    | ❌ No       | Authenticated user ID (when available)        |
| `traceId`       | `mixin` → `RequestContext`    | ✅ Yes      | OpenTelemetry trace ID (stub — future)        |
| `spanId`        | `mixin` → `RequestContext`    | ❌ No       | OpenTelemetry span ID (stub — future)         |
| `context`       | `customProps`                 | ❌ No       | NestJS execution context (e.g., `HTTP`)       |
| `msg`           | Pino                          | ❌ No       | Log message                                   |
| `time`          | Pino                          | ❌ No       | Unix epoch timestamp (ms)                     |

### Promtail / Grafana Alloy Configuration

Extract labels from JSON log lines:

```yaml
# promtail pipeline stage example
pipeline_stages:
    - json:
          expressions:
              level: level
              service: service
              environment: environment
              correlationId: correlationId
              traceId: traceId
    - labels:
          level:
          service:
          environment:
    - structured_metadata:
          correlationId:
          traceId:
```

### Sensitive Data Redaction

The following paths are redacted from log output (replaced with `[Redacted]`):

- `user.email`, `email`
- `user.password`, `password`
- `user.token`, `token`
- `user.verificationCode`, `verificationCode`
- `req.headers.authorization`
- `req.headers.cookie`
- `res.headers["set-cookie"]`

---

## 2. Correlation ID Flow

```
┌──────────┐    X-Correlation-Id     ┌──────────────────────┐
│  Client   │ ───────────────────────→│  CorrelationId       │
│ (Angular) │                         │  Middleware           │
└──────────┘                          │  • generates UUID if  │
                                      │    header is missing  │
                                      │  • stores in          │
                                      │    AsyncLocalStorage  │
                                      │  • sets response      │
                                      │    header             │
                                      └──────────┬───────────┘
                                                 │
                                      ┌──────────▼───────────┐
                                      │  RequestContext       │
                                      │  (AsyncLocalStorage)  │
                                      │                       │
                                      │  Available in:        │
                                      │  • Controllers        │
                                      │  • Services           │
                                      │  • Interceptors       │
                                      │  • Filters            │
                                      │  • Logger mixin       │
                                      └──────────┬───────────┘
                                                 │
                                      ┌──────────▼───────────┐
                                      │  Every log line       │
                                      │  includes:            │
                                      │  • correlationId      │
                                      │  • userId             │
                                      │  • traceId (future)   │
                                      │  • spanId  (future)   │
                                      └───────────────────────┘
```

### Frontend Integration

The Angular client can pass `X-Correlation-Id` on requests to link frontend and backend traces:

```typescript
// Angular HTTP interceptor example
intercept(req: HttpRequest<unknown>, next: HttpHandler) {
  const correlationId = crypto.randomUUID();
  const cloned = req.clone({
    setHeaders: { 'X-Correlation-Id': correlationId }
  });
  return next.handle(cloned);
}
```

---

## 3. Distributed Tracing (→ Grafana Tempo)

### Current State: Stubs

The `RequestContext` interface includes `traceId` and `spanId` fields. The logger mixin conditionally includes them in every log line. Currently they are always `undefined`.

### Future Integration

When ready to enable tracing:

1. Install OpenTelemetry SDK:

    ```bash
    pnpm add @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
    ```

2. Create `src/telemetry.ts` bootstrap file (must run **before** NestJS):

    ```typescript
    import { NodeSDK } from '@opentelemetry/sdk-node';
    import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
    import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

    const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
        instrumentations: [getNodeAutoInstrumentations()],
        serviceName: 'api',
    });

    sdk.start();
    ```

3. Update `CorrelationIdMiddleware` to read trace context from the active span:

    ```typescript
    import { trace } from '@opentelemetry/api';

    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();
    // Pass traceId and spanId into RequestContext.run()
    ```

4. Tempo receives spans via OTLP; Loki logs link to Tempo via `traceId`.

---

## 4. Metrics (→ Prometheus / Grafana)

### Current State: In-Memory Stub

The `MetricsInterceptor` records request metrics in a circular buffer:

| Metric Field    | Description                      |
| --------------- | -------------------------------- |
| `method`        | HTTP method (GET, POST, etc.)    |
| `path`          | Route path pattern               |
| `statusCode`    | HTTP response status code        |
| `durationMs`    | Request duration in milliseconds |
| `correlationId` | Request correlation ID           |
| `timestamp`     | ISO-8601 timestamp               |

Slow requests (>1000ms) are logged at `warn` level for Loki-based alerting.

### Future Integration (prom-client)

When ready to expose a `/metrics` endpoint for Prometheus scraping:

1. Install prom-client:

    ```bash
    pnpm add prom-client
    ```

2. Replace the in-memory buffer in `MetricsInterceptor` with:

    ```typescript
    import { Histogram, Counter, register } from 'prom-client';

    const httpRequestDuration = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    const httpRequestsTotal = new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
    });
    ```

3. Create a `/metrics` endpoint:
    ```typescript
    @Controller('metrics')
    export class MetricsController {
        @Get()
        @Public()
        async getMetrics(@Res() response: Response) {
            response.set('Content-Type', register.contentType);
            response.end(await register.metrics());
        }
    }
    ```

### Prometheus Metric Naming Conventions

Follow [Prometheus naming best practices](https://prometheus.io/docs/practices/naming/):

| Metric Name                     | Type      | Labels                           |
| ------------------------------- | --------- | -------------------------------- |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` |
| `http_requests_total`           | Counter   | `method`, `route`, `status_code` |
| `http_request_errors_total`     | Counter   | `method`, `route`, `error_type`  |
| `app_active_connections`        | Gauge     | —                                |

---

## 5. Error Response Envelope

All error responses follow the `ApiErrorResponse` schema:

```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "error": "Bad Request",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "path": "/auth/register",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "validationErrors": [
        {
            "field": "email",
            "constraints": { "isEmail": "email must be an email" }
        }
    ]
}
```

The `correlationId` in error responses enables direct log correlation in Loki:

```
{service="api"} | json | correlationId = "550e8400-e29b-41d4-a716-446655440000"
```

---

## 6. Grafana Dashboard Suggestions

### Loki Queries

```logql
# Error rate by service
sum(rate({service="api"} | json | level="error" [$__interval])) by (service)

# Slow request logs
{service="api"} | json | level="warn" |= "Slow request"

# Logs for a specific correlation ID
{service="api"} | json | correlationId = "<id>"

# Validation errors
{service="api"} | json | message="Validation failed"
```

### Prometheus Queries (future)

```promql
# Request rate by route
sum(rate(http_requests_total[$__rate_interval])) by (route)

# P95 latency by route
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[$__rate_interval])) by (le, route))

# Error rate
sum(rate(http_requests_total{status_code=~"5.."}[$__rate_interval])) / sum(rate(http_requests_total[$__rate_interval]))
```
