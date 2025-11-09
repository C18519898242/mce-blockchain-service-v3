# MCE Blockchain Service v3

通用区块链接入框架，支持多链（ETH/Tron/Solana/BTC）统一数据交互。

## 项目概述

提供标准化交易格式和接口（构建/扫描/广播），专注于数据查询和交易构建，**不处理私钥管理和签名操作**，确保安全边界清晰。

## 技术栈

- **TypeScript + Node.js + Fastify** (后端服务)
- **Redis** (主要存储 - 钱包地址和缓存)
- **RabbitMQ** (异步处理)
- **@solana/web3.js, ethers.js** (区块链集成)
- **Docker + Kubernetes** (部署)
- **Winston** (日志), **Jest** (测试)

## 核心特性

- 🔗 **多链统一**: 相同接口支持不同区块链特性
- 🔒 **安全边界**: 不处理私钥，专注查询和构建交易
- ⚡ **缓存优先**: Redis 作为主要存储
- 🔄 **异步处理**: 交易事件通过 RabbitMQ 异步处理
- 🎯 **高性能**: 支持 QPS > 1000
- 📈 **可扩展**: 支持新区块链的快速接入

## 项目结构

```
src/
├── main.ts                    # 启动入口
├── domain/                    # 领域层
│   ├── transaction/           # 交易实体和业务逻辑
│   ├── wallet/              # 钱包实体和业务逻辑
│   └── shared/              # 通用领域工具
├── services/                  # 应用服务层
├── infrastructure/           # 基础设施
├── interface/               # 接口层
└── config/               # 配置文件
```

## API 端点

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

## 开发规范

本项目使用 [OpenSpec](./openspec/) 进行规范驱动的开发。

### 代码风格
- 文件名: kebab-case (user-service.ts)
- 变量名: camelCase (userName)
- 类名: PascalCase (UserService)
- 代码格式: 2 spaces, semicolons, single quotes

### Git 工作流
- 分支策略: feature/功能名, hotfix/修复名
- 提交格式: type(scope): description
- 变更管理: OpenSpec 三阶段工作流 (Propose → Implement → Archive)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建项目
npm run build
```

## 贡献指南

1. 查看 [OpenSpec 变更列表](./openspec/changes/)
2. 创建新的变更提案或选择现有任务
3. 按照规范实施变更
4. 提交 Pull Request

## 许可证

[待添加]

## 联系方式

[待添加]
