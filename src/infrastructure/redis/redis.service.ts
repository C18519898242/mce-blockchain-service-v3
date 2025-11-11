import Redis from 'ioredis';
import { Logger } from 'winston';
import { redisConfig } from '@config/redis.config';
import { RedisConnection } from './redis.connection';
import { RedisErrorHandler, RedisError } from './redis.error-handler';
import { 
  IRedisConnection, 
  RedisRepository, 
  RedisStreamOperations,
  RedisSetOperations,
  RedisHashOperations 
} from './redis.types';

export class RedisService implements RedisRepository<any>, RedisStreamOperations, RedisSetOperations, RedisHashOperations {
  private readonly connection: IRedisConnection;
  private readonly errorHandler: RedisErrorHandler;
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.connection = new RedisConnection({
      config: redisConfig,
      logger
    });
    this.errorHandler = new RedisErrorHandler(logger);
  }

  // 连接管理
  async connect(): Promise<void> {
    try {
      await this.connection.connect();
      this.logger.info('Redis service connected successfully');
    } catch (error) {
      const redisError = this.errorHandler.handleError(error as Error, 'connect');
      throw redisError;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.connection.disconnect();
      this.logger.info('Redis service disconnected successfully');
    } catch (error) {
      const redisError = this.errorHandler.handleError(error as Error, 'disconnect');
      throw redisError;
    }
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  async getHealth() {
    return this.connection.getHealth();
  }

  // 基础 Redis 操作
  async get<T>(key: string): Promise<T | null> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'get', key);
      }
    });
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const serializedValue = JSON.stringify(value);
        
        if (ttl) {
          await client.setex(key, ttl, serializedValue);
        } else {
          await client.set(key, serializedValue);
        }
        
        this.logger.debug('Redis SET operation successful', { key, ttl });
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'set', key);
      }
    });
  }

  async del(key: string): Promise<void> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        await client.del(key);
        this.logger.debug('Redis DEL operation successful', { key });
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'del', key);
      }
    });
  }

  async exists(key: string): Promise<boolean> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const result = await client.exists(key);
        return result === 1;
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'exists', key);
      }
    });
  }

  async expire(key: string, ttl: number): Promise<void> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        await client.expire(key, ttl);
        this.logger.debug('Redis EXPIRE operation successful', { key, ttl });
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'expire', key);
      }
    });
  }

  async ttl(key: string): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.ttl(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'ttl', key);
      }
    });
  }

  async keys(pattern: string): Promise<string[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.keys(pattern);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'keys', pattern);
      }
    });
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const values = await client.mget(...keys);
        return values.map((value: string | null) => value ? JSON.parse(value) : null);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'mget', keys.join(','));
      }
    });
  }

  async mset<T>(keyValues: Record<string, T>): Promise<void> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const serializedPairs: string[] = [];
        
        for (const [key, value] of Object.entries(keyValues)) {
          serializedPairs.push(key, JSON.stringify(value));
        }
        
        await client.mset(...serializedPairs);
        this.logger.debug('Redis MSET operation successful', { keys: Object.keys(keyValues) });
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'mset');
      }
    });
  }

  // Stream 操作
  async add(stream: string, data: Record<string, string>, id?: string): Promise<string> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.xadd(stream, id || '*', data);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'xadd', stream);
      }
    });
  }

  async read(streams: Array<{ stream: string; id?: string }>, count?: number): Promise<any[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const streamKeys = streams.map(s => s.stream);
        const streamIds = streams.map(s => s.id || '$');
        
        if (count) {
          return await client.xread('COUNT', count, 'STREAMS', ...streamKeys, ...streamIds);
        } else {
          return await client.xread('STREAMS', ...streamKeys, ...streamIds);
        }
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'xread');
      }
    });
  }

  async ack(stream: string, group: string, id: string): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.xack(stream, group, id);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'xack', `${stream}:${group}:${id}`);
      }
    });
  }

  async groups(stream: string): Promise<any[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.xinfo('GROUPS', stream);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'xinfo-groups', stream);
      }
    });
  }

  async createGroup(stream: string, group: string, id?: string): Promise<string> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.xgroup('CREATE', stream, group, id || '$');
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'xgroup-create', `${stream}:${group}`);
      }
    });
  }

  // Set 操作
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.sadd(key, ...members);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'sadd', key);
      }
    });
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.srem(key, ...members);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'srem', key);
      }
    });
  }

  async smembers(key: string): Promise<string[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.smembers(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'smembers', key);
      }
    });
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const result = await client.sismember(key, member);
        return result === 1;
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'sismember', `${key}:${member}`);
      }
    });
  }

  async scard(key: string): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.scard(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'scard', key);
      }
    });
  }

  // Hash 操作
  async hget(key: string, field: string): Promise<string | null> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hget(key, field);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hget', `${key}:${field}`);
      }
    });
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hset(key, field, value);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hset', `${key}:${field}`);
      }
    });
  }

  async hmset(key: string, data: Record<string, string>): Promise<'OK'> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hmset(key, data);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hmset', key);
      }
    });
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hgetall(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hgetall', key);
      }
    });
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hdel(key, ...fields);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hdel', key);
      }
    });
  }

  async hexists(key: string, field: string): Promise<boolean> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        const result = await client.hexists(key, field);
        return result === 1;
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hexists', `${key}:${field}`);
      }
    });
  }

  async hkeys(key: string): Promise<string[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hkeys(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hkeys', key);
      }
    });
  }

  async hvals(key: string): Promise<string[]> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hvals(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hvals', key);
      }
    });
  }

  async hlen(key: string): Promise<number> {
    return this.errorHandler.createRetryableOperation(async () => {
      try {
        const client = this.connection.getClient();
        return await client.hlen(key);
      } catch (error) {
        throw this.errorHandler.handleError(error as Error, 'hlen', key);
      }
    });
  }

  // 验证连接和基本操作
  async validateConnection(): Promise<boolean> {
    try {
      const health = await this.getHealth();
      return health.status === 'healthy';
    } catch (error) {
      this.logger.error('Redis connection validation failed:', error);
      return false;
    }
  }

  async performBasicOperations(): Promise<boolean> {
    try {
      const testKey = 'test:connection';
      const testValue = { timestamp: Date.now(), test: true };

      // 测试 SET
      await this.set(testKey, testValue, 10);
      
      // 测试 GET
      const retrieved = await this.get<{ timestamp: number; test: boolean }>(testKey);
      if (!retrieved || retrieved.test !== true) {
        throw new Error('GET operation failed');
      }

      // 测试 EXISTS
      const exists = await this.exists(testKey);
      if (!exists) {
        throw new Error('EXISTS operation failed');
      }

      // 测试 DEL
      await this.del(testKey);
      
      // 验证删除
      const existsAfterDelete = await this.exists(testKey);
      if (existsAfterDelete) {
        throw new Error('DEL operation failed');
      }

      this.logger.info('Redis basic operations validation successful');
      return true;
    } catch (error) {
      this.logger.error('Redis basic operations validation failed:', error);
      return false;
    }
  }
}
