/**
 * 基础日志器类
 */

import * as winston from 'winston';
import { loggingConfig, LogLevel } from '../../config/logging.config';

export class Logger {
  private static instance: winston.Logger;
  private static readonly serviceName = 'mce-blockchain-service-v3';

  private constructor() {}

  /**
   * 获取日志器单例
   */
  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      Logger.instance = winston.createLogger({
        level: loggingConfig.level,
        defaultMeta: {
          service: Logger.serviceName,
          environment: process.env.NODE_ENV || 'development'
        },
        transports: loggingConfig.transports
      });
    }
    return Logger.instance;
  }

  /**
   * 设置日志级别
   */
  public static setLevel(level: LogLevel): void {
    const logger = Logger.getInstance();
    logger.level = level;
  }

  /**
   * 获取当前日志级别
   */
  public static getLevel(): string {
    const logger = Logger.getInstance();
    return logger.level;
  }

  /**
   * 记录错误日志
   */
  public static error(message: string, meta?: any): void {
    const logger = Logger.getInstance();
    logger.error(message, meta);
  }

  /**
   * 记录警告日志
   */
  public static warn(message: string, meta?: any): void {
    const logger = Logger.getInstance();
    logger.warn(message, meta);
  }

  /**
   * 记录信息日志
   */
  public static info(message: string, meta?: any): void {
    const logger = Logger.getInstance();
    logger.info(message, meta);
  }

  /**
   * 记录调试日志
   */
  public static debug(message: string, meta?: any): void {
    const logger = Logger.getInstance();
    logger.debug(message, meta);
  }

  /**
   * 记录HTTP请求日志
   */
  public static http(message: string, meta?: any): void {
    const logger = Logger.getInstance();
    logger.http(message, meta);
  }

  /**
   * 记录带上下文的日志
   */
  public static logWithContext(level: LogLevel, message: string, context: any): void {
    const logger = Logger.getInstance();
    logger.log(level, message, { context });
  }
}

// 导出默认日志器实例
export const logger = Logger.getInstance();
