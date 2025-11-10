# Add Blockchain Coin Balance Infrastructure

## 变更概述
构建blockchain + coin + address + balance的核心基础设施，支持多链币种余额查询、监控和事件推送，避免wallet概念混乱，专注于区块链服务的核心职责。

## Why
当前项目缺乏完整的区块链服务基础设施，需要：
1. **清晰的服务边界**：区块链服务专注链上数据，避免wallet概念混乱
2. **标准化的币种管理**：支持blockchain + coin唯一标识（如ETH_USDT）
3. **地址级余额管理**：coin + address → balance的精确映射
4. **实时监控能力**：检测余额变化并推送事件
5. **补偿查询机制**：提供主动查询接口保证数据一致性

## What Changes

### 核心能力添加
- **blockchain能力**：区块链适配、监控、交易查询
- **coin能力**：币种定义、唯一性保证、精度处理  
- **balance能力**：余额查询、监控、批量操作
- **address能力**：根据公钥创建不同链钱包地址、验证钱包地址格式

### 数据模型重构
- 引入Coin实体：blockchain + coin → 唯一标识
- 引入AddressBalance实体：coin + address → balance
- 引入AddressService：公钥到多链地址转换
- Redis数据模式：balance:${coinKey}:${address}

### API接口扩展
- 余额查询：`GET /api/balance/:coinKey/:address`
- 批量查询：`POST /api/balance/batch`
- 监控接口：`POST /api/monitor/start`
- 健康检查：`GET /api/blockchain/health`

### 基础设施升级
- Redis连接和配置
- 多链适配器实现
- 事件推送服务
- 批量操作支持

## Impact

### 影响的specs
- 新增：`specs/blockchain/spec.md`
- 新增：`specs/coin/spec.md`  
- 新增：`specs/balance/spec.md`
- 新增：`specs/address/spec.md`

### 影响的代码文件
- `domain/` - 新增coin、balance、address实体
- `services/` - 新增应用服务层
- `infrastructure/` - 新增Redis仓储、区块链适配器
- `interface/` - 新增路由、DTO

### 部署影响
- 需要Redis服务支持
- 需要多链RPC节点配置
- 可能影响现有API兼容性

## 范围

### 包含内容
- ✅ 完整的blockchain + coin + address + balance基础设施
- ✅ 多链支持（ETH、SOLANA、TRON、BTC）
- ✅ 实时余额监控和事件推送
- ✅ 批量操作和性能优化
- ✅ Redis缓存和数据持久化
- ✅ 完整的API接口和文档

### 不包含内容
- ❌ 钱包管理和聚合功能（由钱包服务负责）
- ❌ 私钥管理和签名操作
- ❌ 具体的业务逻辑（如手续费计算、风控规则）
- ❌ 前端界面和管理控制台

## 依赖项
- Redis服务（用于缓存和事件队列）
- 多链RPC节点（ETH、SOLANA、TRON、BTC）
- @solana/web3.js、ethers.js等区块链SDK
- 现有的日志和基础设施

## 风险评估

### 技术风险
- **中等风险**：多链适配复杂度较高
- **缓解措施**：采用适配器模式，逐步实现各链支持

### 性能风险  
- **中等风险**：大量地址监控可能影响性能
- **缓解措施**：批量操作、智能缓存、异步处理

### 数据一致性风险
- **低风险**：Redis缓存与链上数据可能不一致
- **缓解措施**：补偿查询机制、事件推送保证

## 实现说明
- 遵循现有DDD分层架构
- 使用适配器模式支持多链
- 依赖注入便于测试和扩展
- 遵循项目代码规范和约定
- 完整的错误处理和日志记录
