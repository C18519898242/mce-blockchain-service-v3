import { CoinRepository } from '../CoinRepository';
import { RedisService } from '../../../redis/redis.service';
import { Coin } from '../../../../domain/coin/Coin';
import { Logger } from 'winston';

// Mock RedisService
jest.mock('../../../redis/redis.service');

describe('CoinRepository', () => {
  let coinRepository: CoinRepository;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    // Create mock RedisService
    mockRedisService = new RedisService(mockLogger) as jest.Mocked<RedisService>;
    
    // Create CoinRepository instance
    coinRepository = new CoinRepository(mockRedisService, mockLogger);
    
    // Clear all mock call records
    jest.clearAllMocks();
  });

  describe('findByKey', () => {
    it('should return coin when coin exists in Redis', async () => {
      // Arrange
      const coinKey = 'SOLANA_USDT';
      const coinData = {
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        confirmCount: 32
      };
      
      mockRedisService.hget.mockResolvedValue(JSON.stringify(coinData));

      // Act
      const result = await coinRepository.findByKey(coinKey);

      // Assert
      expect(result).toBeInstanceOf(Coin);
      expect(result?.key).toBe(coinKey);
      expect(result?.name).toBe('Tether USD');
      expect(result?.blockchain).toBe('SOLANA');
      expect(result?.type).toBe('token');
      expect(result?.decimal).toBe(6);
      expect(result?.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
      expect(mockRedisService.hget).toHaveBeenCalledWith('coins', coinKey);
    });

    it('should return null when coin does not exist in Redis', async () => {
      // Arrange
      const coinKey = 'SOLANA_NONEXISTENT';
      mockRedisService.hget.mockResolvedValue(null);

      // Act
      const result = await coinRepository.findByKey(coinKey);

      // Assert
      expect(result).toBeNull();
      expect(mockRedisService.hget).toHaveBeenCalledWith('coins', coinKey);
    });

    it('should throw error when Redis operation fails', async () => {
      // Arrange
      const coinKey = 'SOLANA_USDT';
      const error = new Error('Redis connection failed');
      mockRedisService.hget.mockRejectedValue(error);

      // Act & Assert
      await expect(coinRepository.findByKey(coinKey)).rejects.toThrow('Redis connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error finding coin by key ${coinKey}:`,
        error
      );
    });

    it('should throw error when coin data is invalid JSON', async () => {
      // Arrange
      const coinKey = 'SOLANA_USDT';
      mockRedisService.hget.mockResolvedValue('invalid json data');

      // Act & Assert
      await expect(coinRepository.findByKey(coinKey)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all coins when Redis has coin data', async () => {
      // Arrange
      const coinsHash = {
        'SOLANA_USDT': JSON.stringify({
          key: 'SOLANA_USDT',
          name: 'Tether USD',
          network: 'mainnet',
          blockchain: 'SOLANA',
          type: 'token',
          decimal: 6,
          fullName: 'Tether USD on SOLANA',
          contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          confirmCount: 32
        }),
        'SOLANA_SOL': JSON.stringify({
          key: 'SOLANA_SOL',
          name: 'Solana',
          network: 'mainnet',
          blockchain: 'SOLANA',
          type: 'native',
          decimal: 9,
          fullName: 'Solana on SOLANA',
          confirmCount: 32
        })
      };
      
      mockRedisService.hgetall.mockResolvedValue(coinsHash);

      // Act
      const result = await coinRepository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Coin);
      expect(result[0].key).toBe('SOLANA_USDT');
      expect(result[0].name).toBe('Tether USD');
      expect(result[1]).toBeInstanceOf(Coin);
      expect(result[1].key).toBe('SOLANA_SOL');
      expect(result[1].name).toBe('Solana');
      expect(mockRedisService.hgetall).toHaveBeenCalledWith('coins');
    });

    it('should return empty array when Redis has no coin data', async () => {
      // Arrange
      mockRedisService.hgetall.mockResolvedValue({});

      // Act
      const result = await coinRepository.findAll();

      // Assert
      expect(result).toHaveLength(0);
      expect(mockRedisService.hgetall).toHaveBeenCalledWith('coins');
    });

    it('should return empty array when Redis returns null', async () => {
      // Arrange
      mockRedisService.hgetall.mockResolvedValue(null as any);

      // Act
      const result = await coinRepository.findAll();

      // Assert
      expect(result).toHaveLength(0);
      expect(mockRedisService.hgetall).toHaveBeenCalledWith('coins');
    });

    it('should skip invalid coin data and continue processing valid ones', async () => {
      // Arrange
      const coinsHash = {
        'SOLANA_USDT': JSON.stringify({
          key: 'SOLANA_USDT',
          name: 'Tether USD',
          network: 'mainnet',
          blockchain: 'SOLANA',
          type: 'token',
          decimal: 6,
          fullName: 'Tether USD on SOLANA',
          contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          confirmCount: 32
        }),
        'SOLANA_INVALID': 'invalid json data',
        'SOLANA_SOL': JSON.stringify({
          key: 'SOLANA_SOL',
          name: 'Solana',
          network: 'mainnet',
          blockchain: 'SOLANA',
          type: 'native',
          decimal: 9,
          fullName: 'Solana on SOLANA',
          confirmCount: 32
        })
      };
      
      mockRedisService.hgetall.mockResolvedValue(coinsHash);

      // Act
      const result = await coinRepository.findAll();

      // Assert
      expect(result).toHaveLength(2); // Only two valid coins
      expect(result[0].key).toBe('SOLANA_USDT');
      expect(result[1].key).toBe('SOLANA_SOL');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to parse coin data for key SOLANA_INVALID:',
        expect.any(Error)
      );
    });

    it('should throw error when Redis operation fails', async () => {
      // Arrange
      const error = new Error('Redis connection failed');
      mockRedisService.hgetall.mockRejectedValue(error);

      // Act & Assert
      await expect(coinRepository.findAll()).rejects.toThrow('Redis connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error finding all coins:',
        error
      );
    });
  });

  describe('integration with real Coin class', () => {
    it('should create valid Coin objects from Redis data', async () => {
      // Arrange
      const coinData = {
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        confirmCount: 32
      };
      
      mockRedisService.hget.mockResolvedValue(JSON.stringify(coinData));

      // Act
      const result = await coinRepository.findByKey('SOLANA_USDT');

      // Assert
      expect(result).toBeInstanceOf(Coin);
      expect(result?.isToken()).toBe(true);
      expect(result?.isNative()).toBe(false);
      expect(result?.isMainnet()).toBe(true);
      expect(result?.isTestnet()).toBe(false);
      expect(result?.getFullName()).toBe('Tether USD on SOLANA');
    });

    it('should handle native coin correctly', async () => {
      // Arrange
      const coinData = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };
      
      mockRedisService.hget.mockResolvedValue(JSON.stringify(coinData));

      // Act
      const result = await coinRepository.findByKey('SOLANA_SOL');

      // Assert
      expect(result).toBeInstanceOf(Coin);
      expect(result?.isNative()).toBe(true);
      expect(result?.isToken()).toBe(false);
      expect(result?.contractAddress).toBeUndefined();
    });
  });
});
