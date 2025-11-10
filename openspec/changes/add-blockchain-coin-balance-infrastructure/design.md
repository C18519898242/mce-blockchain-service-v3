# Blockchain Coin Balance Architecture Design

## Context
构建区块链服务的核心基础设施，专注于blockchain + coin + address + balance数据模型，避免wallet概念混淆，提供清晰的微服务边界和高效的余额管理能力。

## Goals / Non-Goals
- **Goals**: 
  - 实现清晰的服务边界，区块链服务专注链上数据
  - 提供高效的余额查询和监控能力
  - 支持多链币种的统一管理
  - 建立可靠的补偿查询机制
- **Non-Goals**: 
  - 不处理钱包管理和聚合功能
  - 不涉及私钥管理和签名操作
  - 不提供钱包级余额视图

## Decisions

### Decision 1: 避免Wallet概念
- **What**: 区块链服务不引入wallet概念，只处理address级别数据
- **Why**: 
  - 避免与钱包服务职责重叠
  - 保持服务边界清晰
  - 减少概念混乱和维护复杂度
- **Alternatives considered**: 
  - 引入完整wallet概念（被否决，职责不清）
  - 简单地址映射（被否决，缺乏币种信息）

### Decision 2: Coin唯一标识设计
- **What**: 使用blockchain + coin组合作为唯一标识（如ETH_USDT）
- **Why**:
  - 确保跨链币种的唯一性
  - 便于Redis键值设计
  - 支持同一链多币种场景
- **Alternatives considered**:
  - 单独coin名称（被否决，无法区分跨链同名币种）
  - 数字ID（被否决，可读性差）

### Decision 3: 适配器模式实现多链支持
- **What**: 每条区块链实现IBlockchainAdapter接口
- **Why**:
  - 统一接口，便于扩展新区块链
  - 隔离各链具体实现细节
  - 便于单元测试和Mock
- **Alternatives considered**:
  - 直接SDK调用（被否决，难以统一管理）
  - 插件系统（被否决，过度复杂）

### Decision 4: Address能力设计
- **What**: 根据公钥创建不同链钱包地址，验证钱包地址格式
- **Why**:
  - 支持从单一公钥生成多链地址
  - 提供标准化的地址验证
  - 避免地址格式错误
- **Alternatives considered**:
  - 只支持地址输入（被否决，不够灵活）
  - 链特定公钥格式（被否决，复杂度高）

## Risks / Trade-offs

### Risk 1: 多链维护复杂度
- **Risk**: 不同区块链API差异大，维护成本高
- **Mitigation**: 
  - 使用适配器模式统一接口
  - 优先实现主流区块链，逐步扩展
  - 建立完善的测试覆盖

### Risk 2: 性能瓶颈
- **Risk**: 大量地址监控可能影响响应性能
- **Mitigation**:
  - 实现批量操作接口
  - 使用Redis缓存减少链上查询
  - 异步处理和事件队列

### Trade-off: 内存使用 vs 响应速度
- **Trade-off**: 缓存更多余额数据提高响应速度，但增加内存使用
- **Decision**: 优先响应速度，使用智能缓存策略和TTL

## Migration Plan

### Phase 1: 基础设施
1. 设置Redis连接和配置
2. 实现基础的Coin和AddressBalance实体
3. 创建Redis仓储模式
4. 建立基础的错误处理和日志

### Phase 2: 核心功能
1. 实现Ethereum适配器
2. 实现地址生成和验证逻辑
3. 实现余额查询和监控逻辑
4. 创建基础的REST API
5. 添加单元测试

### Phase 3: 扩展功能
1. 实现Solana适配器
2. 添加批量操作支持
3. 实现事件推送机制
4. 性能优化和监控

### Phase 4: 完善和集成
1. 添加TRON和BTC支持
2. 完善API文档和测试
3. 集成监控和告警
4. 生产环境部署验证

## Open Questions

1. **币种配置管理**: 是否需要动态添加新币种，还是配置文件管理？
2. **监控策略**: 轮询vs WebSocket，如何平衡实时性和资源消耗？
3. **缓存策略**: 不同币种的TTL设置，如何优化？
4. **错误重试**: 链上查询失败时的重试策略和退避算法？

## Data Models

### Coin Entity
```typescript
export class Coin {
  constructor(
    public readonly key: string,        // 唯一标识：ETH_USDT, SOL_USDT
    public readonly blockchain: string, // ETH, SOLANA, TRON, BTC
    public readonly symbol: string,    // USDT, USDC, ETH
    public readonly decimals: number,   // 精度：6, 8, 18
    public readonly contractAddress?: string  // 代币合约地址
  ) {}
}
```

### AddressBalance Entity
```typescript
export class AddressBalance {
  constructor(
    public readonly address: string,
    public readonly coinKey: string,   // Coin的key
    public readonly balance: number,
    public readonly lastUpdated: string,
    public readonly blockNumber?: number  // 区块号，用于验证
  ) {}
}
```

### Address Service Domain
```typescript
export class AddressDomainService {
  // 根据公钥生成不同链地址
  generateAddressesFromPublicKey(publicKey: string, chains: string[]): Map<string, string>
  
  // 验证地址格式
  validateAddress(address: string, blockchain: string): boolean
  
  // 格式化地址显示
  formatAddress(address: string, blockchain: string): string
}
```

## API Design

### Address相关接口
- `POST /api/addresses/generate` - 根据公钥生成多链地址
- `POST /api/addresses/validate` - 验证地址格式
- `GET /api/addresses/:blockchain/:publicKey` - 获取指定链地址

### 余额相关接口
- `GET /api/balance/:coinKey/:address` - 单地址余额查询
- `POST /api/balance/batch` - 批量余额查询
- `POST /api/monitor/start` - 开始监控地址余额

## Redis Data Patterns

### 基础数据
```
# Coin定义
coin:${coinKey} → Coin对象

# 余额数据
balance:${coinKey}:${address} → AddressBalance对象

# 地址映射（公钥到地址）
addresses:${publicKey}:${blockchain} → address

# 监控状态
monitor:${coinKey}:${address} → MonitorStatus
```

### 集合和索引
```
# 所有活跃地址
addresses:active:${coinKey} → Set<address>

# 监控列表
monitors:active → Set<coinKey:address>

# 余额变化事件流
events:balance:changes → Stream<BalanceChangeEvent>
