import Redis from 'ioredis';
import { IRedisConnection, RedisConnectionOptions, RedisHealthStatus } from './redis.types';

export class RedisConnection implements IRedisConnection {
  private client: Redis | null = null;
  private readonly config: RedisConnectionOptions['config'];
  private readonly logger: RedisConnectionOptions['logger'];

  constructor(options: RedisConnectionOptions) {
    this.config = options.config;
    this.logger = options.logger;
  }

  async connect(): Promise<void> {
    try {
      if (this.client && this.client.status === 'ready') {
        this.logger.info('Redis already connected');
        return;
      }

      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        lazyConnect: this.config.lazyConnect,
        keepAlive: this.config.keepAlive,
        connectTimeout: this.config.connectTimeout,
        commandTimeout: this.config.commandTimeout,
        enableOfflineQueue: this.config.enableOfflineQueue,
        keyPrefix: this.config.keyPrefix,
        family: this.config.family,
      });

      // 设置事件监听器
      this.client.on('connect', () => {
        this.logger.info('Redis connection established');
      });

      this.client.on('ready', () => {
        this.logger.info('Redis connection ready');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.client.on('close', () => {
        this.logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', (delay: number) => {
        this.logger.info(`Redis reconnecting in ${delay}ms`);
      });

      await this.client.connect();
      this.logger.info(`Redis connected to ${this.config.host}:${this.config.port}/${this.config.db}`);

    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.client = null;
        this.logger.info('Redis disconnected');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.client?.status === 'ready' || false;
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  async getHealth(): Promise<RedisHealthStatus> {
    const startTime = Date.now();
    
    try {
      if (!this.client) {
        return {
          status: 'unhealthy',
          error: 'Redis client not initialized'
        };
      }

      // 测试基本连接
      const pong = await this.client.ping();
      const responseTime = Date.now() - startTime;

      if (pong !== 'PONG') {
        return {
          status: 'unhealthy',
          error: 'Redis ping failed',
          responseTime
        };
      }

      // 获取 Redis 信息
      const info = await this.client.info('memory');
      const memoryUsed = this.parseMemoryInfo(info);
      const clientsInfo = await this.client.info('clients');
      const connectionsInfo = this.parseClientsInfo(clientsInfo);

      return {
        status: 'healthy',
        responseTime,
        memory: memoryUsed,
        connections: connectionsInfo
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Redis health check failed:', error);
      
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  }

  private parseMemoryInfo(info: string): { used: number; max: number; percentage: number } {
    const lines = info.split('\r\n');
    let used = 0;
    let max = 0;

    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        used = parseInt(line.split(':')[1], 10);
      } else if (line.startsWith('maxmemory:')) {
        max = parseInt(line.split(':')[1], 10);
      }
    }

    return {
      used,
      max: max || 0,
      percentage: max > 0 ? (used / max) * 100 : 0
    };
  }

  private parseClientsInfo(info: string): { connected: number; max: number } {
    const lines = info.split('\r\n');
    let connected = 0;

    for (const line of lines) {
      if (line.startsWith('connected_clients:')) {
        connected = parseInt(line.split(':')[1], 10);
        break;
      }
    }

    return {
      connected,
      max: 10000 // 默认最大连接数，可根据实际情况调整
    };
  }
}
