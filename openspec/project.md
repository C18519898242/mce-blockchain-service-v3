# Project Context

## Purpose
构建通用区块链接入框架，支持多链（ETH/Tron/Solana/BTC）统一数据交互
Build universal blockchain integration framework for multi-chain (ETH/Tron/Solana/BTC) unified data interaction

提供标准化交易格式和接口（构建/扫描/广播），专注于数据查询和交易构建，**不处理私钥管理和签名操作**，确保安全边界清晰
Provide standardized transaction format and APIs (build/scan/broadcast), focusing on data queries and transaction construction, **excluding private key management and signing operations** for clear security boundaries

## Tech Stack
- **TypeScript + Node.js + Fastify** (后端服务)
- **Redis** (主要存储 - 钱包地址和缓存)
- **RabbitMQ** (异步处理)
- **@solana/web3.js, ethers.js** (区块链集成)
- **Docker + Kubernetes** (部署)
- **Winston** (日志), **Jest** (测试)

## Project Conventions

### Code Style
- **文件名**: kebab-case (user-service.ts)
- **变量名**: camelCase (userName)
- **类名**: PascalCase (UserService)
- **代码格式**: 2 spaces, semicolons, single quotes
- **注释**: JSDoc, English only
- **导入路径**: 使用路径别名（如 `@domain/*`、`@infrastructure/*`、`@services/*`），避免深层的相对路径（`../../`）

### Architecture Patterns
- **DDD 分层**: Domain (业务逻辑) → Application (编排) → Infrastructure (技术)
- **适配器模式**: 每个区块链实现 IBlockchainAdapter
- **依赖注入**: 使用构造函数注入，便于测试
- **错误边界**: 中间件统一处理错误

### Testing Strategy
- **单元测试**: Domain 层纯函数和业务逻辑
- **集成测试**: API 端点与 Redis 集成
- **Mock 策略**: Mock 区块链适配器进行可靠测试

### Git Workflow
- **分支策略**: feature/功能名, hotfix/修复名 (kebab-case, verb-led)
- **提交格式**: type(scope): description (遵循 OpenSpec 变更命名约定)
- **变更管理**: 使用 OpenSpec 三阶段工作流 (Propose → Implement → Archive)
- **变更ID**: kebab-case, 短描述性，动词前缀 (add-, update-, remove-, refactor-)

### Development Environment
- **Shell兼容性**: PowerShell 使用分号 `;` 替代 `&&` 连接命令
- **跨平台**: 确保命令在 Windows (PowerShell) 和 Unix (bash) 环境下均可运行
- **文档示例**: 在文档中使用分号语法确保Windows兼容性

## Domain Context
- **多链统一**: 相同接口支持不同区块链特性，隐藏链间差异
- **只读服务**: 不处理私钥，专注查询和构建交易，确保安全边界
- **缓存优先**: Redis 作为主要存储，钱包服务作为数据恢复源
- **异步处理**: 交易事件通过 RabbitMQ 异步处理，提高系统响应性
- **区块链特性**: 每条链有不同的交易结构、费用模型和确认机制
- **钱包抽象**: 钱包地址格式、余额查询方式因链而异
- **交易状态**: 交易生命周期包括构建、广播、确认等不同阶段

## Important Constraints
- **私钥隔离**: 绝不在本服务处理私钥操作，所有签名由外部钱包服务处理
- **安全边界**: 明确的数据流边界，不越权处理敏感操作
- **性能要求**: 高并发下的快速响应，支持 QPS > 1000
- **数据一致性**: Redis 缓存与钱包服务的最终一致性，容忍短暂不一致
- **可用性**: 99.9% 服务可用性，支持故障恢复和降级策略
- **可扩展性**: 支持新区块链的快速接入，适配器模式实现

## External Dependencies
- **钱包服务**: 负责将钱包数据写入 Redis 缓存，区块链服务从缓存中获取钱包信息，依赖钱包服务的数据初始化
- **区块链节点**: 各链的 RPC 端点（Solana Mainnet, Ethereum Mainnet, Tron, Bitcoin）
- **消息队列**: RabbitMQ 集群用于事件分发和异步处理
- **监控系统**: Prometheus + Grafana 指标收集和可视化
- **容器编排**: Kubernetes 集群用于服务部署和管理
- **CI/CD**: GitHub Actions 用于持续集成和部署
- **DNS 服务**: Cloudflare 或内部 DNS 用于服务发现

## Implementation Details

### Project Structure
```
src/
├── main.ts                    # 启动入口
├── domain/                    # 领域层
│   ├── transaction/           # 交易实体和业务逻辑
│   ├── wallet/              # 钱包实体和业务逻辑
│   └── shared/              # 通用领域工具
├── services/                  # 应用服务层 (编排用例)
│   ├── transaction.service.ts  # 交易服务
│   └── wallet.service.ts     # 钱包服务
├── infrastructure/           # 基础设施
│   ├── api/               # 区块链 API 客户端
│   ├── persistence/        # Redis 仓储
│   └── messaging/         # RabbitMQ 客户端
├── interface/               # 接口层
│   ├── routes/           # Fastify 路由
│   ├── dto/              # 数据传输对象
│   └── middleware/       # 中间件
└── config/               # 配置文件
```

### Core Types
```typescript
// domain/transaction/Transaction.ts
export enum ChainType {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM', 
  BITCOIN = 'BITCOIN',
  TRON = 'TRON'
}

export class Transaction {
  constructor(
    public readonly hash: string,
    public readonly from: string,
    public readonly to: string,
    public readonly amount: number,
    public readonly chain: ChainType,
    public readonly timestamp: string,
    public readonly status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  ) {}
}

export interface TransactionParams {
  from: string;
  to: string;
  amount: number;
  chain: ChainType;
  token?: string;
  gasLimit?: number;  // ETH only
  gasPrice?: number;  // ETH only
  memo?: string;     // Solana only
}
```

### Key Interfaces
```typescript
// infrastructure/api/adapter.interface.ts
export interface IBlockchainAdapter {
  chain: ChainType;
  connect(): Promise<void>;
  getBalance(address: string): Promise<number>;
  buildTransaction(params: TransactionParams): Promise<RawTransaction>;
  broadcastTransaction(tx: RawTransaction): Promise<TransactionHash>;
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;
}
```

### API Endpoints
```
GET    /api/wallets/:address/balance
GET    /api/wallets/:address/transactions
GET    /api/wallets/active
POST   /api/transactions/build
POST   /api/transactions/broadcast
GET    /api/transactions/:hash
GET    /api/health
GET    /api/health/blockchains
```

### Redis Data Patterns
- **Wallets**: `wallet:${chain}:${address}`
- **Transactions**: `tx:${chain}:${hash}`
- **Collections**: `wallets:${chain}` (sets)

### DDD Services Example
```typescript
// Domain Service - 纯业务逻辑
export class TransactionDomainService {
  calculateFee(params: TransactionParams): number {
    // 复杂的费用计算，不依赖外部系统
  }
  
  validateTransactionRules(tx: Transaction): boolean {
    // 业务规则验证，领域专家语言
  }
}

// Application Service - 用例编排
export class TransactionApplicationService {
  constructor(
    private domainService: TransactionDomainService,
    private redisRepo: RedisRepository,
    private blockchainAdapter: IBlockchainAdapter
  ) {}
  
  async buildTransaction(params: TransactionParams): Promise<RawTransaction> {
    // 1. 业务验证（Domain Service）
    const isValid = this.domainService.validateTransactionRules(params);
    
    // 2. 费用计算（Domain Service）
    const fee = this.domainService.calculateFee(params);
    
    // 3. 外部调用（Infrastructure）
    const rawTx = await this.blockchainAdapter.buildTransaction(params);
    
    // 4. 数据缓存（Infrastructure）
    await this.redisRepo.cacheTransaction(rawTx);
    
    return { ...rawTx, estimatedFee: fee };
  }
}
