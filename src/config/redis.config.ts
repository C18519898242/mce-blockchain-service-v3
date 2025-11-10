import { RedisConfig } from '../infrastructure/redis/redis.types';

export const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  enableOfflineQueue: false,
  keyPrefix: 'mce:blockchain:',
  // 连接池配置
  family: 4,
  // 重连策略
  retryDelayOnClusterDown: 300,
  // 内存优化
  maxMemoryPolicy: 'allkeys-lru',
};
