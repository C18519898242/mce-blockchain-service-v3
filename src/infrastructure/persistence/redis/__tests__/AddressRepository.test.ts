import { AddressRepository } from '../AddressRepository';
import { IAddressRepository } from '../../../../domain/address/interfaces/IAddressRepository';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis');
const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

describe('AddressRepository', () => {
  let addressRepository: IAddressRepository;
  let mockRedis: jest.Mocked<Redis>;

  // Test data
  const solanaAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
  const evmAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45';
  const bitcoinAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

  beforeEach(() => {
    // Create fresh mock
    mockRedis = new MockedRedis() as jest.Mocked<Redis>;
    mockRedis.sismember = jest.fn();
    
    // Initialize repository with mocked Redis
    addressRepository = new AddressRepository(mockRedis);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAddressMonitored', () => {
    it('should return true when Solana address is monitored', async () => {
      // Arrange
      mockRedis.sismember.mockResolvedValue(1);

      // Act
      const result = await addressRepository.isAddressMonitored('solana', solanaAddress);

      // Assert
      expect(result).toBe(true);
      expect(mockRedis.sismember).toHaveBeenCalledWith('addresses:solana', solanaAddress);
    });

    it('should return true when EVM address is monitored', async () => {
      // Arrange
      mockRedis.sismember.mockResolvedValue(1);

      // Act
      const result = await addressRepository.isAddressMonitored('evm', evmAddress);

      // Assert
      expect(result).toBe(true);
      expect(mockRedis.sismember).toHaveBeenCalledWith('addresses:evm', evmAddress);
    });

    it('should return true when Bitcoin address is monitored', async () => {
      // Arrange
      mockRedis.sismember.mockResolvedValue(1);

      // Act
      const result = await addressRepository.isAddressMonitored('bitcoin', bitcoinAddress);

      // Assert
      expect(result).toBe(true);
      expect(mockRedis.sismember).toHaveBeenCalledWith('addresses:bitcoin', bitcoinAddress);
    });

    it('should return false when address is not monitored', async () => {
      // Arrange
      mockRedis.sismember.mockResolvedValue(0);

      // Act
      const result = await addressRepository.isAddressMonitored('solana', solanaAddress);

      // Assert
      expect(result).toBe(false);
      expect(mockRedis.sismember).toHaveBeenCalledWith('addresses:solana', solanaAddress);
    });

    it('should handle case-insensitive blockchain names', async () => {
      // Arrange
      mockRedis.sismember.mockResolvedValue(1);

      // Act & Assert
      await addressRepository.isAddressMonitored('SOLANA', solanaAddress);
      expect(mockRedis.sismember).toHaveBeenCalledWith('addresses:solana', solanaAddress);

      await addressRepository.isAddressMonitored('EVM', evmAddress);
      expect(mockRedis.sismember).toHaveBeenCalledWith('addresses:evm', evmAddress);
    });

    it('should throw error when Redis operation fails', async () => {
      // Arrange
      const redisError = new Error('Redis connection failed');
      mockRedis.sismember.mockRejectedValue(redisError);

      // Act & Assert
      await expect(addressRepository.isAddressMonitored('solana', solanaAddress))
        .rejects.toThrow('Failed to check address 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM for blockchain solana: Error: Redis connection failed');
    });

    it('should handle different address formats correctly', async () => {
      // Test various address formats
      const testCases = [
        { blockchain: 'solana', address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' },
        { blockchain: 'evm', address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45' },
        { blockchain: 'evm', address: '0x742d35cc6634c0532925a3b8d4c9db96c4b4db45' }, // lowercase
        { blockchain: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
        { blockchain: 'tron', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' }
      ];

      for (const testCase of testCases) {
        // Arrange
        mockRedis.sismember.mockResolvedValue(1);

        // Act
        const result = await addressRepository.isAddressMonitored(testCase.blockchain, testCase.address);

        // Assert
        expect(result).toBe(true);
        expect(mockRedis.sismember).toHaveBeenCalledWith(
          `addresses:${testCase.blockchain.toLowerCase()}`,
          testCase.address
        );
      }
    });
  });

  describe('Redis Integration Test Setup', () => {
    it('should document Redis data initialization for manual testing', () => {
      // This test documents how to initialize Redis data for manual testing
      const redisSetupCommands = [
        // Initialize Solana addresses
        `SADD addresses:solana ${solanaAddress}`,
        'SADD addresses:solana EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        
        // Initialize EVM addresses
        `SADD addresses:evm ${evmAddress}`,
        'SADD addresses:evm 0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
        
        // Initialize Bitcoin addresses
        `SADD addresses:bitcoin ${bitcoinAddress}`,
        'SADD addresses:bitcoin 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        
        // Initialize Tron addresses
        'SADD addresses:tron TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        'SADD addresses:tron TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
      ];

      // Log setup commands for manual testing
      console.log('Redis Setup Commands for Manual Testing:');
      redisSetupCommands.forEach(cmd => console.log(cmd));
      
      // This test always passes - it's just for documentation
      expect(true).toBe(true);
    });
  });
});
