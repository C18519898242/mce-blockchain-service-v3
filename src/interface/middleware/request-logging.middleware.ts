/**
 * 请求日志中间件
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/logging/logger';

// 扩展Request接口以添加开始时间
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}

// 敏感信息过滤器
const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

const filterSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const filtered = { ...data };
  for (const field of sensitiveFields) {
    if (field in filtered) {
      filtered[field] = '[FILTERED]';
    }
  }
  return filtered;
};

/**
 * 请求日志中间件
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 记录请求开始时间
  req.startTime = Date.now();

  // 记录请求信息
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    headers: filterSensitiveData(req.headers),
    query: filterSensitiveData(req.query),
    params: req.params,
    body: filterSensitiveData(req.body)
  };

  logger.info('Incoming request', {
    type: 'request',
    ...requestData
  });

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    const responseData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // 根据状态码选择日志级别
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', {
        type: 'response_error',
        ...responseData
      });
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', {
        type: 'response_warning',
        ...responseData
      });
    } else {
      logger.http('Request completed successfully', {
        type: 'response_success',
        ...responseData
      });
    }
  });

  // 监听响应错误事件
  res.on('error', (error) => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    logger.error('Response error occurred', {
      type: 'response_error',
      method: req.method,
      url: req.url,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack
    });
  });

  next();
}
