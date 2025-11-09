# Change: Setup Project Structure and Basic Configuration

## Why
为多区块链接入框架建立基础的项目架构，包括目录结构、TypeScript配置、简单测试框架和核心类型定义，为后续开发提供标准化的代码基础。

## What Changes
- 创建DDD分层目录结构（domain/application/infrastructure/interface）
- 配置TypeScript编译环境
- 配置简单的Jest测试框架（跳过ESLint/Prettier）
- 实现核心类型定义（Transaction、ChainType、IBlockchainAdapter）
- 添加Node.js RESTful框架（Express）和依赖注入相关类库配置

## Impact
- Affected specs: project（新增基础架构要求）
- Affected code: 新增src目录和配置文件
- Dependencies: 使用现有的package.json依赖
