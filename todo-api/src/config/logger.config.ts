import { config } from 'dotenv';
import { LoggerOptions, format, transports } from 'winston';
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
              format.align(),
              format.splat(),
              format.printf((info) => `${info.timestamp} [${info.level}][${process.pid}]: ${info.message}`),
          ),
    defaultMeta: { service: 'todo-api' },
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
