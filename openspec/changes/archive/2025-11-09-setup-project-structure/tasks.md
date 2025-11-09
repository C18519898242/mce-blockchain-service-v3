## 1. 项目目录结构创建
- [x] 1.1 创建DDD分层目录结构（domain/application/infrastructure/interface）
- [x] 1.2 创建domain子目录（transaction/wallet/shared）
- [x] 1.3 创建infrastructure子目录（api/persistence/messaging）
- [x] 1.4 创建interface子目录（routes/dto/middleware）
- [x] 1.5 创建config目录

## 2. TypeScript配置
- [x] 2.1 创建tsconfig.json配置文件
- [x] 2.2 配置编译选项和路径映射
- [x] 2.3 测试TypeScript编译功能

## 3. Jest测试配置
- [x] 3.1 创建简单的jest.config.js
- [x] 3.2 配置基础测试环境
- [x] 3.3 验证Jest可以正常运行

## 4. 核心类型定义
- [x] 4.1 创建domain/transaction/Transaction.ts
- [x] 4.2 创建infrastructure/api/adapter.interface.ts
- [x] 4.3 实现ChainType枚举
- [x] 4.4 实现Transaction类和TransactionParams接口
- [x] 4.5 实现IBlockchainAdapter接口

## 5. 框架配置（Express + NestJS）
- [x] 5.1 创建Express应用基础结构
- [x] 5.2 配置NestJS应用基础结构
- [x] 5.3 配置依赖注入容器（NestJS内置 + reflect-metadata）
- [x] 5.4 创建基础的API路由结构（包括/index路由）
- [x] 5.5 创建/index路由，显示"mce-blockchain-service-v3"，端口9001
- [x] 5.6 配置中间件和错误处理


## 6. 验证和完成
- [x] 6.1 验证TypeScript编译无错误
- [x] 6.2 验证Jest测试可以运行
- [x] 6.3 验证Express应用可以启动（端口9001）
- [x] 6.4 验证NestJS应用可以启动
- [x] 6.5 验证/index路由返回"mce-blockchain-service-v3"
- [x] 6.6 确认目录结构符合DDD规范
