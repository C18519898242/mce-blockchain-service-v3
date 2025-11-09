/**
 * 日志配置文件
 */

import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// 日志级别
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 日志配置接口
export interface LoggingConfig {
  level: LogLevel;
  format: winston.Logform.Format;
  transports: winston.transport[];
}

// 获取当前环境
const environment = process.env.NODE_ENV || 'development';

// 创建自定义日志格式
const createFormat = (): winston.Logform.Format => {
  if (environment === 'production') {
    // 生产环境：结构化JSON格式
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );
  } else {
    // 开发环境：友好的控制台格式
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    );
  }
};

// 创建传输器
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // 控制台输出
  transports.push(
    new winston.transports.Console({
      format: createFormat()
    })
  );

  // 文件输出（开发和生产环境都启用）
  // 错误日志文件
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: LogLevel.ERROR,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  );

  // 所有日志文件
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  );

  return transports;
};

// 默认日志配置
export const loggingConfig: LoggingConfig = {
  level: environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  format: createFormat(),
  transports: createTransports()
};
