# Blockchain Coin Balance Architecture Design

## Context
构建区块链服务的核心基础设施，专注于blockchain + coin + address + balance数据模型，避免wallet概念混淆，提供清晰的微服务边界和高效的余额管理能力。

## Goals / Non-Goals
- **Goals**: 
  - 实现清晰的服务边界，区块链服务专注链上数据
  - 提供高效的余额查询能力
  - 支持多链币种的统一管理
- **Non-Goals**: 
  - 不处理钱包管理和聚合功能
  - 不涉及私钥管理和签名操作
  - 不提供钱包级余额视图
  - 不保存余额数据（由Wallet Service负责）

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

### Decision 5: Repository接口位置设计
- **What**: Repository接口定义在Domain层，具体实现在Infrastructure层
- **Why**:
  - 符合DDD领域驱动设计原则，保持领域层纯净
  - 领域层定义业务需要的抽象接口，不依赖具体技术
  - 便于单元测试，可以轻松Mock Repository
  - 支持多种存储实现的灵活切换
- **Alternatives considered**:
  - 接口和实现都在Infrastructure层（被否决，违反依赖倒置原则）
  - 接口在Application层（被否决，Application层不应包含领域抽象）

### Decision 6: BlockchainAdapter分层设计
- **What**: IBlockchainAdapter接口定义在Domain层，具体实现在Infrastructure层
- **Why**:
  - 符合DDD依赖倒置原则，Domain层定义区块链操作抽象
  - Application层只依赖Domain抽象，不依赖具体实现
  - 便于单元测试和Mock
  - 保持Domain层技术无关性
- **Alternatives considered**:
  - IBlockchainAdapter在Infrastructure层（被否决，违反依赖倒置）
  - 直接在Application层调用SDK（被否决，难以统一管理）

## Risks / Trade-offs

### Risk 1: 多链维护复杂度
- **Risk**: 不同区块链API差异大，维护成本高
- **Mitigation**: 
  - 使用适配器模式统一接口
  - 优先实现主流区块链，逐步扩展
  - 建立完善的测试覆盖

### Risk 2: 性能瓶颈
- **Risk**: 大量地址查询可能影响响应性能
- **Mitigation**:
  - 使用Redis缓存币种配置减少查询
  - 异步处理和错误重试

## Migration Plan

### Phase 1: 基础设施
1. 设置Redis连接和配置
2. 实现基础的Coin和AddressBalance实体
3. 创建Redis仓储模式
4. 建立基础的错误处理和日志

### Phase 2: 核心功能
1. 实现Solana适配器（Mock）
2. 实现地址生成和验证逻辑
3. 实现余额查询逻辑
4. 创建基础的REST API
5. 添加单元测试

### Phase 3: 扩展功能
1. 实现真实Solana适配器
2. 添加Ethereum适配器
3. 性能优化和监控

### Phase 4: 完善和集成
1. 添加TRON和BTC支持
2. 完善API文档和测试
3. 集成监控和告警
4. 生产环境部署验证

## Open Questions

1. **币种配置管理**: 是否需要动态添加新币种，还是配置文件管理？
2. **错误重试**: 链上查询失败时的重试策略和退避算法？

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

### Repository Interfaces (Domain Layer)
```typescript
// src/domain/coin/interfaces/ICoinRepository.ts
export interface ICoinRepository {
  findByKey(coinKey: string): Promise<Coin | null>;
  save(coin: Coin): Promise<void>;
  findAll(): Promise<Coin[]>;
  delete(coinKey: string): Promise<void>;
  findByBlockchain(blockchain: string): Promise<Coin[]>;
}

// src/domain/blockchain/IBlockchainAdapter.ts
export interface IBlockchainAdapter {
  getBalance(address: string, coin: Coin): Promise<number>;
  getLatestBlockNumber(): Promise<number>;
  validateAddress(address: string): boolean;
  generateAddressFromPublicKey(publicKey: string): string;
}

// src/domain/address/interfaces/IAddressRepository.ts
export interface IAddressRepository {
  findByPublicKeyAndChain(publicKey: string, blockchain: string): Promise<string | null>;
  saveAddressMapping(publicKey: string, blockchain: string, address: string): Promise<void>;
  getAddressesByPublicKey(publicKey: string): Promise<Map<string, string>>;
  deleteAddressMapping(publicKey: string, blockchain: string): Promise<void>;
}
```

### Repository Implementations (Infrastructure Layer)
```typescript
// src/infrastructure/persistence/redis/CoinRepository.ts
export class CoinRepository implements ICoinRepository {
  constructor(private redisService: RedisService) {}
  
  async findByKey(coinKey: string): Promise<Coin | null> {
    const data = await this.redisService.get(`coin:${coinKey}`);
    return data ? JSON.parse(data) : null;
  }
  
  async save(coin: Coin): Promise<void> {
    await this.redisService.set(`coin:${coin.key}`, JSON.stringify(coin));
  }
  
  // ... 其他实现
}

// src/infrastructure/persistence/redis/AddressRepository.ts
export class AddressRepository implements IAddressRepository {
  constructor(private redisService: RedisService) {}
  
  async findByPublicKeyAndChain(publicKey: string, blockchain: string): Promise<string | null> {
    return await this.redisService.get(`addresses:${publicKey}:${blockchain}`);
  }
  
  async saveAddressMapping(publicKey: string, blockchain: string, address: string): Promise<void> {
    await this.redisService.set(`addresses:${publicKey}:${blockchain}`, address);
  }
  
  // ... 其他实现
}

// src/infrastructure/api/solana.adapter.ts - Mock实现
export class SolanaBlockchainAdapter implements IBlockchainAdapter {
  async getBalance(address: string, coin: Coin): Promise<number> {
    // Mock实现，返回模拟余额
    return 1000000; // 1 USDT (6 decimals)
  }
  
  async getLatestBlockNumber(): Promise<number> {
    return 123456; // Mock区块号
  }
  
  validateAddress(address: string): boolean {
    // Mock地址验证
    return address.length > 0;
  }
  
  generateAddressFromPublicKey(publicKey: string): string {
    // Mock地址生成
    return `mock_address_${publicKey.substring(0, 8)}`;
  }
}
```

### Application Service Layer
```typescript
// src/services/balance.service.ts
export class BalanceApplicationService {
  constructor(
    private blockchainAdapter: IBlockchainAdapter,  // Domain层接口
    private coinRepository: ICoinRepository      // Domain层接口
  ) {}
  
  async getBalance(address: string, coinKey: string): Promise<AddressBalance | null> {
    const coin = await this.coinRepository.findByKey(coinKey);
    if (!coin) return null;
    
    // 直接调用区块链适配器，不需要Repository层
    const balance = await this.blockchainAdapter.getBalance(address, coin);
    
    return new AddressBalance(
      address,
      coinKey,
      balance,
      new Date().toISOString(),
      await this.blockchainAdapter.getLatestBlockNumber()
    );
  }
}
```

## API Design

### Address相关接口
- `POST /api/addresses/generate` - 根据公钥生成多链地址
- `POST /api/addresses/validate` - 验证地址格式
- `GET /api/addresses/:blockchain/:publicKey` - 获取指定链地址

### 余额相关接口
- `GET /api/balance/:coinKey/:address` - 单地址余额查询

## Redis Data Patterns

### 基础数据
```
# Coin定义
coin:${coinKey} → Coin对象

# 地址映射（公钥到地址）
addresses:${publicKey}:${blockchain} → address
```

## Service Boundaries

### Blockchain Service 职责
- 提供实时链上数据查询
- 管理币种配置信息
- 地址生成和验证
- 不保存余额数据

### Wallet Service 职责
- 管理用户钱包信息
- 保存和聚合余额数据
- 提供钱包级视图
- 调用Blockchain Service获取链上数据

### 数据流向
```
Wallet Service → 调用 → Blockchain Service → 查询 → 区块链网络
     ↑                                              ↑
   存储余额                                    实时查询
