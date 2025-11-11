# 服务边界分析文档

## 概述

本文档基于 `add-blockchain-coin-balance-infrastructure` 需求，分析 Blockchain Service、Wallet Service 和 MPC Signing Service 三个微服务的边界和责任划分。

## 服务架构概览

我们采用三层微服务架构，确保职责清晰、安全隔离和技术解耦：

```
用户请求
    ↓
Wallet Service ←→ Blockchain Service
    ↓              ↓
业务逻辑        链上数据
用户界面        实时监控
    ↓              ↓
MPC Signing Service ←→ Blockchain Service
    ↓                    ↓
密钥管理              地址验证
交易签名              余额查询
```

## 1. Blockchain Service（本服务）

### 核心职责
- **链上数据基础设施**：专注于 `blockchain + coin + address + balance` 数据模型
- **多链适配**：通过 IBlockchainAdapter 接口支持 ETH、SOLANA、TRON、BTC
- **地址服务**：根据公钥生成不同链地址，验证地址格式
- **余额监控**：检测余额变化，推送事件
- **币种管理**：使用 `blockchain + coin` 组合作为唯一标识（如 ETH_USDT）

### 数据边界
- 只处理 `address` 级别数据，不涉及 `wallet` 概念
- `AddressBalance` 实体：`coin + address → balance` 的精确映射
- 不存储私钥，不进行签名操作

### 明确排除的功能
- ❌ 钱包管理和聚合功能
- ❌ 私钥管理和签名操作  
- ❌ 钱包级余额视图
- ❌ 具体业务逻辑（如手续费计算、风控规则）

### 核心数据模型
```typescript
// Coin 实体
export class Coin {
  constructor(
    public readonly key: string,        // 唯一标识：ETH_USDT, SOL_USDT
    public readonly blockchain: string, // ETH, SOLANA, TRON, BTC
    public readonly symbol: string,    // USDT, USDC, ETH
    public readonly decimals: number,   // 精度：6, 8, 18
    public readonly contractAddress?: string  // 代币合约地址
  ) {}
}

// AddressBalance 实体
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

### 主要 API 接口
- `POST /api/addresses/generate` - 根据公钥生成多链地址
- `POST /api/addresses/validate` - 验证地址格式
- `GET /api/addresses/:blockchain/:publicKey` - 获取指定链地址
- `GET /api/balance/:coinKey/:address` - 单地址余额查询
- `POST /api/balance/batch` - 批量余额查询
- `POST /api/monitor/start` - 开始监控地址余额

## 2. Wallet Service

### 核心职责
- **钱包业务逻辑**：用户钱包概念管理（可能包含多个地址）
- **余额聚合**：钱包级别的余额聚合和视图
- **用户管理**：用户身份验证和权限控制
- **业务规则**：手续费计算、风控规则等业务逻辑

### 数据边界
- 管理用户钱包概念，可能包含多个地址的聚合
- 不直接存储私钥
- 不直接进行链上数据查询

### 明确排除的功能
- ❌ 私钥存储和管理
- ❌ 交易签名操作
- ❌ 直接的链上数据查询

## 3. MPC Signing Service

### 核心职责
- **安全密钥管理**：私钥的安全存储和管理（MPC方式）
- **交易签名**：交易签名和授权
- **密钥分片**：多方计算和密钥分片管理
- **安全合规**：满足安全和合规要求

### 数据边界
- 专门处理私钥相关操作
- 不涉及钱包业务逻辑
- 不直接查询链上数据（可能需要验证地址）

## 典型业务流程

### 1. 余额查询流程
```
用户 → Wallet Service → 创建钱包请求
Wallet Service → MPC Signing Service → 生成密钥对
MPC Service → 返回公钥信息
Wallet Service → Blockchain Service → 根据公钥生成多链地址
Blockchain Service → 返回地址列表
Wallet Service → 保存钱包和地址映射关系
Wallet Service → 返回钱包创建结果
```

### 2. 交易签名流程
```
用户 → Wallet Service → 构建交易
Wallet Service → MPC Signing Service → 请求签名
MPC Service → Blockchain Service → 验证地址/余额（可选）
MPC Service → 返回签名结果
Wallet Service → Blockchain Service → 广播交易
```

### 3. 地址生成流程
```
用户 → Wallet Service → 请求地址生成
Wallet Service → Blockchain Service → 根据公钥生成多链地址
Blockchain Service → 返回地址列表
Wallet Service → 保存地址映射关系
```

## 服务间通信模式

### 同步通信
- Wallet Service → Blockchain Service：余额查询、地址生成
- Wallet Service → MPC Signing Service：签名请求
- MPC Signing Service → Blockchain Service：地址验证（可选）

### 异步通信
- Blockchain Service → Wallet Service：余额变化事件推送
- Blockchain Service → MPC Signing Service：交易状态通知（可选）

## 架构优势

1. **安全隔离**：MPC服务独立管理私钥，符合安全最佳实践
2. **职责清晰**：每个服务都有明确的单一职责
3. **技术解耦**：可以独立升级和扩展各个服务
4. **合规友好**：MPC服务可以独立满足安全和合规要求
5. **可扩展性**：新增区块链支持只需修改 Blockchain Service

## Redis 数据模式

### 基础数据
```
# Coin定义
coin:${coinKey} → Coin对象

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
```

## 风险和缓解措施

### 技术风险
- **多链维护复杂度**：使用适配器模式统一接口，优先实现主流区块链
- **性能瓶颈**：批量操作、Redis缓存、异步处理

### 安全风险
- **私钥泄露**：MPC服务独立部署，严格访问控制
- **数据一致性**：补偿查询机制、事件推送保证

## 后续优化方向

1. **监控完善**：添加更详细的监控指标和告警
2. **性能优化**：缓存策略优化、批量操作改进
3. **安全加固**：API访问控制、数据加密传输
4. **文档完善**：API文档、部署文档、运维手册

---

*注意：本文档基于当前需求分析，可能存在不准确之处，需要根据实际业务需求和技术实现进行调整和完善。*
