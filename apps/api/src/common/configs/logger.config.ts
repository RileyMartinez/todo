import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModuleAsyncOptions } from 'nest-winston';
import { ConfigConstants } from 'src/common/constants/config.constants';
import { LoggerOptions, format, transports } from 'winston';
import { AppConstants } from '../constants/app.constants';
import DailyRotateFile = require('winston-daily-rotate-file');

export const loggerConfig: WinstonModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService): Promise<LoggerOptions> => {
        const isProd = process.env.APP_ENV === AppConstants.PROD;
        const loggerLevel = configService.getOrThrow(ConfigConstants.LOGGER_LEVEL);
        const loggerDirectory = configService.getOrThrow(ConfigConstants.LOGGER_DIRECTORY);
        const loggerMaxSize = configService.getOrThrow(ConfigConstants.LOGGER_MAX_SIZE);
        const loggerFileLifetime = configService.getOrThrow(ConfigConstants.LOGGER_FILE_LIFETIME);

        return {
            level: loggerLevel,
            format: isProd
                ? format.combine(format.timestamp(), format.json())
                : format.combine(
                      format.colorize(),
                      format.timestamp({ format: 'MM/DD/YYYY, hh:mm:ss A' }),
                      format.ms(),
                      format.align(),
                      format.splat(),
                      format.printf(
                          (info) =>
                              `${info.timestamp} [${info.level}][${info.context}][${process.pid}]: ${info.message} ${info.ms} ${info.stack ? `\n${info.stack}` : ''}`,
                      ),
                  ),
            defaultMeta: { service: 'api', pid: process.pid },
            handleExceptions: true,
            handleRejections: true,
            transports: [
                new transports.Console(),
                new DailyRotateFile({
                    filename: `${loggerDirectory}/combined-%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: loggerMaxSize,
                    maxFiles: loggerFileLifetime,
                }),
                new DailyRotateFile({
                    filename: `${loggerDirectory}/error-%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: loggerMaxSize,
                    maxFiles: loggerFileLifetime,
                    level: 'error',
                }),
            ],
        };
    },
    inject: [ConfigService],
};
