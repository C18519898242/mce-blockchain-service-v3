import { Logger } from 'winston';

export enum RedisErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  COMMAND_ERROR = 'COMMAND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class RedisError extends Error {
  constructor(
    public readonly type: RedisErrorType,
    message: string,
    public readonly originalError?: Error,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'RedisError';
  }
}

export class RedisErrorHandler {
  constructor(private readonly logger: Logger) {}

  handleError(error: Error, operation?: string, key?: string): RedisError {
    const redisError = this.classifyError(error);
    
    this.logger.error('Redis operation failed', {
      type: redisError.type,
      message: redisError.message,
      operation,
      key,
      originalError: error.message,
      stack: error.stack,
    });

    return redisError;
  }

  private classifyError(error: Error): RedisError {
    const message = error.message.toLowerCase();

    if (message.includes('econnrefused') || message.includes('connect')) {
      return new RedisError(
        RedisErrorType.CONNECTION_ERROR,
        'Redis connection failed',
        error
      );
    }

    if (message.includes('timeout') || message.includes('etimedout')) {
      return new RedisError(
        RedisErrorType.TIMEOUT_ERROR,
        'Redis operation timed out',
        error
      );
    }

    if (message.includes('noauth') || message.includes('auth')) {
      return new RedisError(
        RedisErrorType.AUTHENTICATION_ERROR,
        'Redis authentication failed',
        error
      );
    }

    if (message.includes('memory') || message.includes('oom')) {
      return new RedisError(
        RedisErrorType.MEMORY_ERROR,
        'Redis memory limit exceeded',
        error
      );
    }

    if (message.includes('command') || message.includes('syntax')) {
      return new RedisError(
        RedisErrorType.COMMAND_ERROR,
        'Redis command execution failed',
        error
      );
    }

    return new RedisError(
      RedisErrorType.UNKNOWN_ERROR,
      `Redis error: ${error.message}`,
      error
    );
  }

  isRetryableError(error: RedisError): boolean {
    switch (error.type) {
      case RedisErrorType.CONNECTION_ERROR:
      case RedisErrorType.TIMEOUT_ERROR:
        return true;
      case RedisErrorType.MEMORY_ERROR:
      case RedisErrorType.AUTHENTICATION_ERROR:
      case RedisErrorType.COMMAND_ERROR:
        return false;
      case RedisErrorType.UNKNOWN_ERROR:
      default:
        return true; // 默认可重试
    }
  }

  shouldFailFast(error: RedisError): boolean {
    switch (error.type) {
      case RedisErrorType.AUTHENTICATION_ERROR:
      case RedisErrorType.COMMAND_ERROR:
        return true;
      default:
        return false;
    }
  }

  createRetryableOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return this.executeWithRetry(operation, maxRetries, delay);
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    baseDelay: number,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const redisError = error instanceof RedisError ? error : this.handleError(error as Error);

      if (attempt >= maxRetries || !this.isRetryableError(redisError)) {
        throw redisError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1); // 指数退避
      this.logger.warn(`Retrying Redis operation in ${delay}ms (attempt ${attempt}/${maxRetries})`, {
        errorType: redisError.type,
        attempt,
        maxRetries,
      });

      await this.sleep(delay);
      return this.executeWithRetry(operation, maxRetries, baseDelay, attempt + 1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
