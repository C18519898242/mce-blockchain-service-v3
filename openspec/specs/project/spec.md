# project Specification

## Purpose
TBD - created by archiving change update-dev-environment-specs. Update Purpose after archive.
## Requirements
### Requirement: Project Conventions
项目 SHALL 遵循标准化的开发约定和最佳实践。

#### Scenario: 代码风格
- **WHEN** 开发者编写代码
- **THEN** 代码 SHALL 遵循kebab-case文件名、camelCase变量名、PascalCase类名约定

#### Scenario: 架构模式
- **WHEN** 设计系统架构
- **THEN** 系统 SHALL 使用DDD分层、适配器模式和依赖注入

### Requirement: Git Workflow
项目 SHALL 使用标准化的Git工作流程，支持团队协作和变更管理。

#### Scenario: 分支管理
- **WHEN** 开发者需要并行开发功能
- **THEN** 系统 SHALL 支持feature/功能名和hotfix/修复名的分支策略

#### Scenario: 提交规范
- **WHEN** 开发者提交代码变更
- **THEN** 系统 SHALL 遵循type(scope): description的提交格式

#### Scenario: 变更管理
- **WHEN** 进行功能开发或修复
- **THEN** 系统 SHALL 使用OpenSpec三阶段工作流(Propose → Implement → Archive)

### Requirement: Development Environment
项目 SHALL 支持跨平台开发环境，确保在Windows和Unix系统下的一致性。

#### Scenario: PowerShell兼容性
- **WHEN** 在Windows PowerShell环境下执行命令
- **THEN** 开发者 SHALL 使用分号`;`替代`&&`连接命令

#### Scenario: 跨平台文档
- **WHEN** 编写开发文档和命令示例
- **THEN** 文档 SHALL 使用跨平台兼容的命令语法

#### Scenario: 环境一致性
- **WHEN** 在不同操作系统下开发
- **THEN** 项目 SHALL 确保命令和脚本在PowerShell和bash环境下均可运行

### Requirement: Project Structure Setup
项目 SHALL 建立标准的DDD分层架构目录结构。

#### Scenario: 基础目录创建
- **WHEN** 项目初始化时
- **THEN** 系统 SHALL 创建domain/application/infrastructure/interface分层目录
- **AND** 系统 SHALL 在domain下创建transaction/wallet/shared子目录
- **AND** 系统 SHALL 在infrastructure下创建api/persistence/messaging子目录
- **AND** 系统 SHALL 在interface下创建routes/dto/middleware子目录

#### Scenario: TypeScript配置
- **WHEN** 开发者需要编译TypeScript代码
- **THEN** 系统 SHALL 提供tsconfig.json配置文件
- **AND** 配置 SHALL 支持ES2022目标和严格模式
- **AND** 配置 SHALL 设置正确的outDir和rootDir

#### Scenario: 测试框架配置
- **WHEN** 开发者需要运行测试
- **THEN** 系统 SHALL 提供Jest配置
- **AND** 配置 SHALL 支持TypeScript文件测试
- **AND** 配置 SHALL 设置简单的测试环境

#### Scenario: 核心类型定义
- **WHEN** 开发者需要实现区块链功能
- **THEN** 系统 SHALL 提供ChainType枚举
- **AND** 系统 SHALL 提供Transaction类
- **AND** 系统 SHALL 提供TransactionParams接口
- **AND** 系统 SHALL 提供IBlockchainAdapter接口

### Requirement: RESTful Framework and Dependency Injection
项目 SHALL 配置Express + NestJS RESTful框架和依赖注入容器。

#### Scenario: Express应用配置
- **WHEN** 开发者需要启动HTTP服务
- **THEN** 系统 SHALL 提供Express应用基础结构
- **AND** 系统 SHALL 支持路由注册和中间件配置
- **AND** 系统 SHALL 提供统一的错误处理机制
- **AND** 系统 SHALL 在端口9001上监听请求

#### Scenario: NestJS应用配置
- **WHEN** 开发者需要企业级HTTP服务
- **THEN** 系统 SHALL 提供NestJS应用基础结构
- **AND** 系统 SHALL 支持模块化架构
- **AND** 系统 SHALL 提供内置依赖注入
- **AND** 系统 SHALL 支持装饰器模式

#### Scenario: Index路由实现
- **WHEN** 用户访问/index端点
- **THEN** 系统 SHALL 返回"mce-blockchain-service-v3"
- **AND** 系统 SHALL 显示服务已验证可用信息

#### Scenario: 依赖注入配置
- **WHEN** 开发者需要管理服务依赖
- **THEN** 系统 SHALL 提供依赖注入容器配置
- **AND** 系统 SHALL 支持构造函数注入模式
- **AND** 系统 SHALL 便于单元测试时的依赖替换

### Requirement: Development Environment Validation
项目 SHALL 确保开发环境配置正确。

#### Scenario: 编译验证
- **WHEN** 开发者运行编译命令
- **THEN** TypeScript编译 SHALL 无错误完成

#### Scenario: 测试验证
- **WHEN** 开发者运行测试命令
- **THEN** Jest测试 SHALL 正常运行

#### Scenario: 应用启动验证
- **WHEN** 开发者启动应用
- **THEN** Express应用 SHALL 成功启动并监听端口9001

#### Scenario: Index路由验证
- **WHEN** 开发者访问http://localhost:9001/index
- **THEN** 系统 SHALL 返回"mce-blockchain-service-v3"响应
- **AND** 系统 SHALL 确认服务已验证可用

