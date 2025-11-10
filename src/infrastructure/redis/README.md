# Redis 基础设施

这个模块提供了完整的 Redis 连接、操作和验证功能，专为区块链服务的余额管理系统设计。

## 功能特性

- **连接管理**: 自动重连、健康检查、连接池管理
- **错误处理**: 智能重试、错误分类、日志记录
- **数据操作**: 支持 String、Hash、Set、Stream 等数据结构
- **性能优化**: 批量操作、智能缓存、指数退避重试
- **验证工具**: 完整的功能验证和性能测试

## 核心组件

### 1. RedisService
主要的 Redis 服务类，提供所有 Redis 操作接口。

```typescript
import { RedisService } from '../infrastructure/redis';
import { logger } from '../infrastructure/logging/logger';

const redisService = new RedisService(logger);

// 连接 Redis
await redisService.connect();

// 基本操作
await redisService.set('user:123', { name: 'Alice', balance: 1000 });
const user = await redisService.get('user:123');

// 批量操作
await redisService.mset({
  'user:124': { name: 'Bob', balance: 2000 },
  'user:125': { name: 'Charlie', balance: 3000 }
});
const users = await redisService.mget(['user:124', 'user:125']);
```

### 2. RedisConnection
连接管理器，处理 Redis 连接的生命周期。

```typescript
import { RedisConnection } from '../infrastructure/redis';

const connection = new RedisConnection({
  config: redisConfig,
  logger
});

await connection.connect();
const health = await connection.getHealth();
console.log('Redis health:', health);
```

### 3. RedisErrorHandler
错误处理器，提供智能重试和错误分类。

```typescript
import { RedisErrorHandler } from '../infrastructure/redis';

const errorHandler = new RedisErrorHandler(logger);

// 创建可重试的操作
const result = await errorHandler.createRetryableOperation(
  () => redisService.get('some-key'),
  3, // 最大重试次数
  1000 // 基础延迟（毫秒）
);
```

### 4. RedisValidator
验证工具，确保 Redis 基础设施正常工作。

```typescript
import { RedisValidator } from '../infrastructure/redis';

const validator = new RedisValidator(redisService, logger);
const validation = await validator.validateFullSetup();

if (validation.success) {
  console.log('Redis infrastructure is ready!');
} else {
  console.log('Issues found:', validation.details);
}
```

## 数据操作接口

### 基础操作
- `get<T>(key)`: 获取值
- `set<T>(key, value, ttl?)`: 设置值（可选TTL）
- `del(key)`: 删除键
- `exists(key)`: 检查键是否存在
- `expire(key, ttl)`: 设置过期时间

### 批量操作
- `mget<T>(keys)`: 批量获取
- `mset<T>(keyValues)`: 批量设置
- `keys(pattern)`: 模糊查询键

### Hash 操作
- `hget(key, field)`: 获取哈希字段
- `hset(key, field, value)`: 设置哈希字段
- `hmset(key, data)`: 批量设置哈希字段
- `hgetall(key)`: 获取所有哈希字段
- `hdel(key, ...fields)`: 删除哈希字段

### Set 操作
- `sadd(key, ...members)`: 添加集合成员
- `srem(key, ...members)`: 删除集合成员
- `smembers(key)`: 获取所有集合成员
- `sismember(key, member)`: 检查成员是否存在
- `scard(key)`: 获取集合大小

### Stream 操作
- `add(stream, data, id?)`: 添加流消息
- `read(streams, count?)`: 读取流消息
- `ack(stream, group, id)`: 确认消息处理
- `createGroup(stream, group, id?)`: 创建消费者组

## 配置

### 环境变量配置

项目使用 `.env` 文件来管理 Redis 配置。首先复制环境变量模板：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件设置你的 Redis 配置：

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 环境变量说明

- `REDIS_HOST`: Redis 服务器地址（默认: localhost）
- `REDIS_PORT`: Redis 服务器端口（默认: 6379）
- `REDIS_PASSWORD`: Redis 认证密码（可选，默认为空）
- `REDIS_DB`: Redis 数据库编号（默认: 0）

### 代码中的配置

Redis 连接配置在 `src/config/redis.config.ts` 中定义：

```typescript
export const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  // ... 其他配置选项
};
```

### 不同环境的配置

- **开发环境**: 使用 `.env` 文件中的配置
- **测试环境**: 可以创建 `.env.test` 文件
- **生产环境**: 通过环境变量或容器配置设置

注意：`.env` 文件已添加到 `.gitignore` 中，不会被提交到版本控制。

## 错误类型

Redis 错误分类：

- `CONNECTION_ERROR`: 连接错误（可重试）
- `TIMEOUT_ERROR`: 超时错误（可重试）
- `AUTHENTICATION_ERROR`: 认证错误（不可重试）
- `MEMORY_ERROR`: 内存错误（不可重试）
- `COMMAND_ERROR`: 命令错误（不可重试）
- `UNKNOWN_ERROR`: 未知错误（可重试）

## 性能特性

- **连接池**: 自动管理连接生命周期
- **批量操作**: 支持批量读写操作
- **智能重试**: 指数退避重试策略
- **健康检查**: 定期检查连接状态
- **内存优化**: 自动 JSON 序列化/反序列化

## 使用示例

### 余额管理示例

```typescript
// 保存用户余额
await redisService.set(`balance:${userId}`, {
  amount: 1000,
  currency: 'USDT',
  lastUpdated: new Date().toISOString()
}, 3600); // 1小时过期

// 获取用户余额
const balance = await redisService.get(`balance:${userId}`);

// 批量更新余额
await redisService.mset({
  `balance:user1`: { amount: 1000, currency: 'USDT' },
  `balance:user2`: { amount: 2000, currency: 'USDT' },
  `balance:user3`: { amount: 3000, currency: 'USDT' }
});
```

### 监控集合示例

```typescript
// 添加活跃地址到监控集合
await redisService.sadd('monitored:addresses', 
  '0x123...', '0x456...', '0x789...');

// 检查地址是否在监控中
const isMonitored = await redisService.sismember('monitored:addresses', '0x123...');

// 获取所有监控地址
const addresses = await redisService.smembers('monitored:addresses');
```

### 事件流示例

```typescript
// 添加余额变化事件
await redisService.add('balance:changes', {
  address: '0x123...',
  oldBalance: '1000',
  newBalance: '1500',
  timestamp: Date.now().toString(),
  blockchain: 'ETH'
});

// 读取最新事件
const events = await redisService.read([
  { stream: 'balance:changes', id: '$' }
], 10);
```

## 最佳实践

1. **使用 TTL**: 为所有缓存数据设置合理的过期时间
2. **批量操作**: 尽可能使用批量操作减少网络开销
3. **错误处理**: 始终使用错误处理器的重试机制
4. **连接验证**: 在应用启动时运行验证器
5. **键命名**: 使用一致的键命名规范
6. **监控**: 定期检查 Redis 健康状态

## 故障排除

### 常见问题

1. **连接超时**: 检查 Redis 服务器状态和网络连接
2. **认证失败**: 验证密码配置
3. **内存不足**: 监控 Redis 内存使用情况
4. **性能问题**: 使用批量操作和适当的缓存策略

### 调试

启用调试日志：

```typescript
// 在 logger 配置中设置 debug 级别
logger.level = 'debug';
```

运行验证器检查：

```typescript
const validator = new RedisValidator(redisService, logger);
const result = await validator.validateFullSetup();
console.log('Validation result:', result);
