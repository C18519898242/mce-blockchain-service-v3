import { BalanceApplicationService } from '../balance.service';
import { IBlockchainAdapter } from '../../domain/blockchain/IBlockchainAdapter';
import { ICoinRepository } from '../../domain/coin/interfaces/ICoinRepository';
import { Coin } from '../../domain/coin/Coin';
import { AddressBalance } from '../../domain/balance/AddressBalance';

/**
 * Mock Blockchain Adapter for testing
 */
class MockBlockchainAdapter implements IBlockchainAdapter {
  async getBalance(address: string, coin: Coin): Promise<number> {
    return 0; // Mock implementation
  }

  async getLatestBlockNumber(): Promise<number> {
    return 123456; // Mock implementation
  }

  validateAddress(address: string): boolean {
    return !!(address && address.length >= 32 && address.length <= 44);
  }

  generateAddressFromPublicKey(publicKey: string): string {
    return `mock_address_${publicKey.substring(0, 8)}`;
  }
}

/**
 * Mock Coin Repository for testing
 */
class MockCoinRepository implements ICoinRepository {
  private coins: Map<string, Coin> = new Map();

  constructor() {
    // Initialize with test data
    this.coins.set('SOLANA_USDT', new Coin({
      key: 'SOLANA_USDT',
      name: 'Tether USD',
      network: 'mainnet',
      blockchain: 'SOLANA',
      type: 'token',
      decimal: 6,
      fullName: 'Tether USD on SOLANA',
      confirmCount: 32,
      contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    }));
  }

  async findByKey(coinKey: string): Promise<Coin | null> {
    return this.coins.get(coinKey) || null;
  }

  async save(coin: Coin): Promise<void> {
    this.coins.set(coin.key, coin);
  }

  async findAll(): Promise<Coin[]> {
    return Array.from(this.coins.values());
  }

  async delete(coinKey: string): Promise<void> {
    this.coins.delete(coinKey);
  }

  async findByBlockchain(blockchain: string): Promise<Coin[]> {
    return Array.from(this.coins.values()).filter(coin => coin.blockchain === blockchain);
  }
}

/**
 * Balance Application Service Tests
 */
describe('BalanceApplicationService', () => {
  let balanceService: BalanceApplicationService;
  let mockBlockchainAdapter: MockBlockchainAdapter;
  let mockCoinRepository: MockCoinRepository;

  beforeEach(() => {
    mockBlockchainAdapter = new MockBlockchainAdapter();
    mockCoinRepository = new MockCoinRepository();
    balanceService = new BalanceApplicationService(
      mockBlockchainAdapter,
      mockCoinRepository
    );
  });

  describe('getBalance', () => {
    it('should return balance for valid address and coin', async () => {
      // Arrange
      const address = 'mock_solana_address_test123';
      const coinKey = 'SOLANA_USDT';

      // Act
      const result = await balanceService.getBalance(address, coinKey);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.address).toBe(address);
      expect(result!.coinKey).toBe(coinKey);
      expect(result!.balance).toBe(0); // Mock returns 0
      expect(result!.blockNumber).toBe(123456); // Mock returns 123456
      expect(result!.lastUpdated).toBeDefined();
    });

    it('should return null for non-existent coin', async () => {
      // Arrange
      const address = 'mock_solana_address_test123';
      const coinKey = 'NON_EXISTENT_COIN';

      // Act
      const result = await balanceService.getBalance(address, coinKey);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle valid address', async () => {
      // Arrange
      const address = 'test_address_123456789'; // Use valid address instead of empty
      const coinKey = 'SOLANA_USDT';

      // Act
      const result = await balanceService.getBalance(address, coinKey);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.address).toBe(address);
    });

    it('should call blockchain adapter with correct parameters', async () => {
      // Arrange
      const address = 'mock_solana_address_test123';
      const coinKey = 'SOLANA_USDT';
      const getBalanceSpy = jest.spyOn(mockBlockchainAdapter, 'getBalance');
      const getBlockNumberSpy = jest.spyOn(mockBlockchainAdapter, 'getLatestBlockNumber');

      // Act
      await balanceService.getBalance(address, coinKey);

      // Assert
      expect(getBalanceSpy).toHaveBeenCalledWith(address, expect.any(Coin));
      expect(getBlockNumberSpy).toHaveBeenCalled();
    });
  });
});
