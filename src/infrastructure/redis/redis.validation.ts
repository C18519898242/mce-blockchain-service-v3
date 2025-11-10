import { Logger } from 'winston';
import { RedisService } from './redis.service';

export class RedisValidator {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: Logger
  ) {}

  async validateFullSetup(): Promise<{ success: boolean; details: Record<string, any> }> {
    const results: Record<string, any> = {
      connection: false,
      basicOperations: false,
      streamOperations: false,
      setOperations: false,
      hashOperations: false,
      errorHandling: false,
      performance: false
    };

    try {
      this.logger.info('Starting Redis infrastructure validation...');

      // 1. 验证连接
      results.connection = await this.validateConnection();

      // 2. 验证基本操作
      if (results.connection) {
        results.basicOperations = await this.redisService.performBasicOperations();
      }

      // 3. 验证 Stream 操作
      if (results.basicOperations) {
        results.streamOperations = await this.validateStreamOperations();
      }

      // 4. 验证 Set 操作
      if (results.streamOperations) {
        results.setOperations = await this.validateSetOperations();
      }

      // 5. 验证 Hash 操作
      if (results.setOperations) {
        results.hashOperations = await this.validateHashOperations();
      }

      // 6. 验证错误处理
      if (results.hashOperations) {
        results.errorHandling = await this.validateErrorHandling();
      }

      // 7. 验证性能
      if (results.errorHandling) {
        results.performance = await this.validatePerformance();
      }

      const overallSuccess = Object.values(results).every(result => result === true);

      if (overallSuccess) {
        this.logger.info('Redis infrastructure validation completed successfully', results);
      } else {
        this.logger.warn('Redis infrastructure validation completed with issues', results);
      }

      return {
        success: overallSuccess,
        details: results
      };

    } catch (error) {
      this.logger.error('Redis validation failed with error:', error);
      return {
        success: false,
        details: {
          ...results,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async validateConnection(): Promise<boolean> {
    try {
      if (!this.redisService.isConnected()) {
        await this.redisService.connect();
      }

      const health = await this.redisService.getHealth();
      const isHealthy = health.status === 'healthy';

      this.logger.info('Connection validation result', {
        status: health.status,
        responseTime: health.responseTime,
        memory: health.memory,
        connections: health.connections
      });

      return isHealthy;
    } catch (error) {
      this.logger.error('Connection validation failed:', error);
      return false;
    }
  }

  private async validateStreamOperations(): Promise<boolean> {
    try {
      const streamKey = 'test:validation:stream';
      const groupKey = 'test-group';

      // 创建流组
      await this.redisService.createGroup(streamKey, groupKey, '0');

      // 添加消息
      const messageId = await this.redisService.add(streamKey, {
        type: 'test',
        timestamp: Date.now().toString()
      });

      // 读取消息
      const messages = await this.redisService.read([
        { stream: streamKey, id: '0' }
      ], 1);

      // 清理
      await this.redisService.del(streamKey);

      const success = messageId !== undefined && messages.length > 0;
      this.logger.info('Stream operations validation', { success, messageId, messagesCount: messages.length });
      return success;
    } catch (error) {
      this.logger.error('Stream operations validation failed:', error);
      return false;
    }
  }

  private async validateSetOperations(): Promise<boolean> {
    try {
      const setKey = 'test:validation:set';
      const members = ['member1', 'member2', 'member3'];

      // 添加成员
      const addResult = await this.redisService.sadd(setKey, ...members);

      // 检查成员存在
      const isMember = await this.redisService.sismember(setKey, 'member1');

      // 获取所有成员
      const allMembers = await this.redisService.smembers(setKey);

      // 获取集合大小
      const size = await this.redisService.scard(setKey);

      // 清理
      await this.redisService.del(setKey);

      const success = addResult === members.length && 
                     isMember && 
                     allMembers.length === members.length && 
                     size === members.length;

      this.logger.info('Set operations validation', { 
        success, 
        addResult, 
        isMember, 
        allMembersCount: allMembers.length, 
        size 
      });

      return success;
    } catch (error) {
      this.logger.error('Set operations validation failed:', error);
      return false;
    }
  }

  private async validateHashOperations(): Promise<boolean> {
    try {
      const hashKey = 'test:validation:hash';
      const hashData = {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3'
      };

      // 设置多个字段
      await this.redisService.hmset(hashKey, hashData);

      // 获取单个字段
      const field1Value = await this.redisService.hget(hashKey, 'field1');

      // 检查字段存在
      const fieldExists = await this.redisService.hexists(hashKey, 'field2');

      // 获取所有字段和值
      const allData = await this.redisService.hgetall(hashKey);

      // 获取字段数量
      const fieldCount = await this.redisService.hlen(hashKey);

      // 删除字段
      const deleteResult = await this.redisService.hdel(hashKey, 'field3');

      // 清理
      await this.redisService.del(hashKey);

      const success = field1Value === 'value1' &&
                     fieldExists &&
                     Object.keys(allData).length === 3 &&
                     fieldCount === 3 &&
                     deleteResult === 1;

      this.logger.info('Hash operations validation', {
        success,
        field1Value,
        fieldExists,
        allDataCount: Object.keys(allData).length,
        fieldCount,
        deleteResult
      });

      return success;
    } catch (error) {
      this.logger.error('Hash operations validation failed:', error);
      return false;
    }
  }

  private async validateErrorHandling(): Promise<boolean> {
    try {
      // 测试重试机制 - 尝试操作一个不存在的键
      const nonExistentKey = 'test:nonexistent:' + Date.now();
      
      try {
        await this.redisService.get(nonExistentKey);
        // 应该返回 null，不抛出错误
        return true;
      } catch (error) {
        // 如果抛出错误，说明错误处理有问题
        this.logger.error('Error handling validation failed - unexpected error:', error);
        return false;
      }
    } catch (error) {
      this.logger.error('Error handling validation failed:', error);
      return false;
    }
  }

  private async validatePerformance(): Promise<boolean> {
    try {
      const iterations = 100;
      const testKey = 'test:performance:' + Date.now();
      const testValue = { data: 'test', index: 0 };

      const startTime = Date.now();

      // 批量 SET 操作
      const setOperations: Promise<void>[] = [];
      for (let i = 0; i < iterations; i++) {
        testValue.index = i;
        setOperations.push(this.redisService.set(`${testKey}:${i}`, testValue));
      }
      await Promise.all(setOperations);

      // 批量 GET 操作
      const getOperations: Promise<any>[] = [];
      for (let i = 0; i < iterations; i++) {
        getOperations.push(this.redisService.get(`${testKey}:${i}`));
      }
      const results = await Promise.all(getOperations);

      // 清理
      const deletePromises = [];
      for (let i = 0; i < iterations; i++) {
        deletePromises.push(this.redisService.del(`${testKey}:${i}`));
      }
      await Promise.all(deletePromises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerOperation = totalTime / (iterations * 3); // SET + GET + DEL

      const success = results.every(result => result !== null && result.data === 'test');
      
      this.logger.info('Performance validation', {
        success,
        iterations,
        totalTime: `${totalTime}ms`,
        avgTimePerOperation: `${avgTimePerOperation.toFixed(2)}ms`,
        operationsPerSecond: Math.round((iterations * 3) / (totalTime / 1000))
      });

      return success && avgTimePerOperation < 10; // 平均每个操作应该少于10ms
    } catch (error) {
      this.logger.error('Performance validation failed:', error);
      return false;
    }
  }
}
