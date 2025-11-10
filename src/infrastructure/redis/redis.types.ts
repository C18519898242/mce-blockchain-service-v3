export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  connectTimeout: number;
  commandTimeout: number;
  enableOfflineQueue: boolean;
  keyPrefix: string;
  family: 4 | 6;
  retryDelayOnClusterDown: number;
  maxMemoryPolicy?: string;
}

export interface RedisConnectionOptions {
  readonly config: RedisConfig;
  readonly logger: any;
}

export interface IRedisConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getClient(): any;
  getHealth(): Promise<RedisHealthStatus>;
}

export interface RedisHealthStatus {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  memory?: {
    used: number;
    max: number;
    percentage: number;
  };
  connections?: {
    connected: number;
    max: number;
  };
}

export interface RedisRepository<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  mget(keys: string[]): Promise<(T | null)[]>;
  mset(keyValues: Record<string, T>): Promise<void>;
}

export interface RedisStreamOperations {
  add(stream: string, data: Record<string, string>, id?: string): Promise<string>;
  read(streams: Array<{ stream: string; id?: string }>, count?: number): Promise<any[]>;
  ack(stream: string, group: string, id: string): Promise<number>;
  groups(stream: string): Promise<any[]>;
  createGroup(stream: string, group: string, id?: string): Promise<string>;
}

export interface RedisSetOperations {
  sadd(key: string, ...members: string[]): Promise<number>;
  srem(key: string, ...members: string[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  sismember(key: string, member: string): Promise<boolean>;
  scard(key: string): Promise<number>;
}

export interface RedisHashOperations {
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string): Promise<number>;
  hmset(key: string, data: Record<string, string>): Promise<string>;
  hgetall(key: string): Promise<Record<string, string>>;
  hdel(key: string, ...fields: string[]): Promise<number>;
  hexists(key: string, field: string): Promise<boolean>;
  hkeys(key: string): Promise<string[]>;
  hvals(key: string): Promise<string[]>;
  hlen(key: string): Promise<number>;
}
