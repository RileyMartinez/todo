import { config } from 'dotenv';
import { LoggerOptions, format, transports } from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import DailyRotateFile = require('winston-daily-rotate-file');

config();
const isProd = process.env.ENV === 'prod';

export const loggerConfig: LoggerOptions = {
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
        new transports.Console({
            format: format.combine(
                format.timestamp(),
                format.ms(),
                nestWinstonModuleUtilities.format.nestLike('todo-api', {
                    colors: true,
                    prettyPrint: true,
                    processId: true,
                }),
            ),
        }),
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
