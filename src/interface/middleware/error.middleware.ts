/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/logging/logger';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 记录错误日志
  logger.error('Unhandled error occurred', {
    type: 'unhandled_error',
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    path: req.path,
    timestamp: new Date().toISOString()
  });

  // 根据环境决定是否暴露错误详情
  const environment = process.env.NODE_ENV || 'development';
  const errorResponse: any = {
    message: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (environment === 'development') {
    errorResponse.error = error.message;
    errorResponse.stack = error.stack;
  }

  res.status(500).json(errorResponse);
}
