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

