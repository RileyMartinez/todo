import { LoggerOptions, format, transports } from 'winston';
import { WinstonModuleAsyncOptions } from 'nest-winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigConstants } from 'src/constants/config.constants';

export const loggerConfig: WinstonModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<LoggerOptions> => {
        const isProd = configService.get(ConfigConstants.ENV) === 'prod';
        return {
            level: isProd ? 'info' : 'debug',
            format: isProd
                ? format.combine(format.timestamp(), format.json())
                : format.combine(
                      format.colorize(),
                      format.timestamp(),
                      format.ms(),
                      format.align(),
                      format.splat(),
                      format.printf(
                          (info) =>
                              `${info.timestamp} [${info.level}][${info.context}][${process.pid}]: ${info.message} ${info.ms} ${info.stack ? `\n${info.stack}` : ''}`,
                      ),
                  ),
            defaultMeta: { service: 'todo-api', pid: process.pid },
            handleExceptions: true,
            handleRejections: true,
            transports: [
                new transports.Console(),
                new DailyRotateFile({
                    filename: 'logs/combined-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                }),
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error',
                }),
            ],
        };
    },
    inject: [ConfigService],
};
