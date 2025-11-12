# NestJS依赖注入架构重构计划

## 准备工作
- [ ] 查看现有代码结构，了解当前实现
- [ ] 确认项目是否已安装NestJS相关依赖

## 模块结构重构
- [ ] 创建/更新AppModule，定义全局模块和提供者
- [ ] 为Blockchain、Coin、Address、Balance等功能创建专用模块
- [ ] 配置模块间的依赖关系

## 服务层重构
- [ ] 使用@Injectable()装饰器标记服务类
- [ ] 重构IBlockchainAdapter接口实现，使用依赖注入
- [ ] 重构CoinRepository实现，使用依赖注入
- [ ] 重构AddressService和BalanceService，使用构造函数注入

## 控制器层重构
- [ ] 使用@Controller()装饰器标记控制器
- [ ] 在控制器中使用@Inject()注入所需服务
- [ ] 更新路由定义

## 主入口文件更新
- [ ] 修改main.ts，使用NestFactory.create()创建应用
- [ ] 配置全局中间件、过滤器和拦截器
- [ ] 设置应用启动和监听逻辑

## 配置管理
- [ ] 使用@ConfigModule()管理应用配置
- [ ] 为Redis、区块链等配置创建专用的配置提供者

## 测试和验证
- [ ] 运行TypeScript检查，确保重构后代码无错误
- [ ] 运行单元测试和集成测试
- [ ] 验证应用功能正常工作

## 部署准备
- [ ] 更新package.json中的启动脚本
- [ ] 更新环境变量配置文档
