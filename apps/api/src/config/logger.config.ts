import { RequestContext } from '@/common/context/request-context';
import { AppConstants } from '@/shared/constants/app.constants';
import { ConfigConstants } from '@/shared/constants/config.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams, Params } from 'nestjs-pino';
import { name as serviceName } from '../../package.json';

export const loggerConfig: LoggerModuleAsyncParams = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<Params> => {
        const env = configService.getOrThrow(ConfigConstants.APP_ENV);
        const level = configService.getOrThrow(ConfigConstants.LOGGER_LEVEL);

        return {
            pinoHttp: {
                level: level,
                transport:
                    env === AppConstants.DEV
                        ? {
                              target: 'pino-pretty',
                              options: {
                                  colorize: true,
                                  levelFirst: true,
                                  translateTime: 'SYS:mm/dd/yyyy HH:mm:ss.l',
                              },
                          }
                        : undefined,

                /**
                 * Mixin injects contextual fields into every log line.
                 *
                 * Loki-compatible labels: `service`, `environment`, `correlationId`, `userId`
                 * OpenTelemetry stubs: `traceId`, `spanId` — populated as `undefined`
                 * until `@opentelemetry/sdk-node` is integrated; Promtail/Alloy can
                 * extract these as labels once they carry values.
                 */
                mixin: () => {
                    const ctx = RequestContext.get();
                    return {
                        service: serviceName,
                        environment: env,
                        ...(ctx?.correlationId && { correlationId: ctx.correlationId }),
                        ...(ctx?.userId && { userId: ctx.userId }),
                        // OpenTelemetry trace context — stubs for future integration
                        ...(ctx?.traceId && { traceId: ctx.traceId }),
                        ...(ctx?.spanId && { spanId: ctx.spanId }),
                    };
                },

                // Output level as string name instead of numeric value
                formatters: {
                    level: (label: string) => ({ level: label }),
                },

                customProps: (_req, _res) => ({
                    context: 'HTTP',
                }),

                // Reduce request/response log noise
                serializers: {
                    req: (req) => ({
                        id: req.id,
                        method: req.method,
                        url: req.url,
                        query: req.query,
                        params: req.params,
                    }),
                    res: (res) => ({
                        statusCode: res.statusCode,
                    }),
                },

                redact: [
                    'user.email',
                    'email',
                    'user.password',
                    'password',
                    'user.token',
                    'token',
                    'user.verificationCode',
                    'verificationCode',
                    'req.headers.authorization',
                    'req.headers.cookie',
                    'res.headers["set-cookie"]',
                ],
            },
        };
    },
};
