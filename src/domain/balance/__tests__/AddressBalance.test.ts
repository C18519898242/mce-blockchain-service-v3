/**
 * AddressBalance Entity Tests
 * 测试 AddressBalance 实体的功能
 */

import { 
  AddressBalance, 
  AddressBalanceProperties,
  AddressBalanceJSON,
  isValidAddress,
  isValidCoinKey,
  isValidBalance,
  isValidTimestamp
} from '../AddressBalance';

describe('AddressBalance Entity', () => {
  describe('Constructor', () => {
    it('should create a valid AddressBalance with all parameters', () => {
      const now = new Date().toISOString();
      const properties: AddressBalanceProperties = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: now,
        blockNumber: 12345
      };

      const balance = new AddressBalance(properties);

      expect(balance.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
      expect(balance.coinKey).toBe('ETH_ETH');
      expect(balance.balance).toBe(1000000000000000000000);
      expect(balance.lastUpdated).toBe(now);
      expect(balance.blockNumber).toBe(12345);
    });

    it('should create AddressBalance without block number', () => {
      const now = new Date().toISOString();
      const properties: AddressBalanceProperties = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: now
      };

      const balance = new AddressBalance(properties);

      expect(balance.blockNumber).toBeUndefined();
    });
  });

  describe('Business Methods', () => {
    let balance: AddressBalance;
    let olderBalance: AddressBalance;

    beforeEach(() => {
      const now = new Date().toISOString();
      const olderTime = new Date(Date.now() - 60000).toISOString(); // 1 minute ago

      balance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: now,
        blockNumber: 100
      });

      olderBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 500000000000000000000,
        lastUpdated: olderTime,
        blockNumber: 99
      });
    });

    it('should check if balance is positive correctly', () => {
      expect(balance.isPositive()).toBe(true);
      
      const zeroBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 0,
        lastUpdated: new Date().toISOString()
      });
      expect(zeroBalance.isPositive()).toBe(false);
    });

    it('should check if balance is zero correctly', () => {
      expect(balance.isZero()).toBe(false);
      
      const zeroBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 0,
        lastUpdated: new Date().toISOString()
      });
      expect(zeroBalance.isZero()).toBe(true);
    });

    it('should check if balance is negative correctly', () => {
      expect(balance.isNegative()).toBe(false);
      
      const negativeBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: -1000000000000000000000,
        lastUpdated: new Date().toISOString()
      });
      expect(negativeBalance.isNegative()).toBe(true);
    });

    it('should check if has block number correctly', () => {
      expect(balance.hasBlockNumber()).toBe(true);
      
      const noBlockBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: new Date().toISOString()
      });
      expect(noBlockBalance.hasBlockNumber()).toBe(false);
    });

    it('should check if newer than another balance', () => {
      expect(balance.isNewerThan(olderBalance)).toBe(true);
      expect(olderBalance.isNewerThan(balance)).toBe(false);
    });

    it('should check if at specific block', () => {
      expect(balance.isAtBlock(100)).toBe(true);
      expect(balance.isAtBlock(99)).toBe(false);
    });

    it('should check if after specific block', () => {
      expect(balance.isAfterBlock(99)).toBe(true);
      expect(balance.isAfterBlock(100)).toBe(false);
      
      const noBlockBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: new Date().toISOString()
      });
      expect(noBlockBalance.isAfterBlock(99)).toBe(false);
    });

    it('should get formatted balance correctly', () => {
      // Test with 18 decimals (ETH)
      const formatted = balance.getFormattedBalance(18);
      expect(formatted).toContain('1'); // Should be around 1 ETH
      
      // Test with 6 decimals (USDT)
      const usdtBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_USDT',
        balance: 1000000,
        lastUpdated: new Date().toISOString()
      });
      const usdtFormatted = usdtBalance.getFormattedBalance(6);
      expect(usdtFormatted).toContain('1'); // Should be around 1 USDT
    });

    it('should handle very small balances in formatted output', () => {
      const smallBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1, // 1 wei
        lastUpdated: new Date().toISOString()
      });
      
      const formatted = smallBalance.getFormattedBalance(18);
      expect(formatted).toMatch(/\d*e/); // Should be in exponential notation
    });
  });

  describe('Factory Methods', () => {
    it('should create balance using create method', () => {
      const balance = AddressBalance.create(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        'ETH_ETH',
        1000000000000000000000,
        12345
      );

      expect(balance.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
      expect(balance.coinKey).toBe('ETH_ETH');
      expect(balance.balance).toBe(1000000000000000000000);
      expect(balance.blockNumber).toBe(12345);
      expect(balance.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should create balance with timestamp using withTimestamp method', () => {
      const timestamp = '2023-01-01T00:00:00.000Z';
      const balance = AddressBalance.withTimestamp(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        'ETH_ETH',
        1000000000000000000000,
        timestamp,
        12345
      );

      expect(balance.lastUpdated).toBe(timestamp);
      expect(balance.blockNumber).toBe(12345);
    });
  });

  describe('Update Methods', () => {
    let balance: AddressBalance;

    beforeEach(() => {
      balance = AddressBalance.create(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        'ETH_ETH',
        1000000000000000000000,
        100
      );
    });

    it('should update balance correctly', () => {
      const updated = balance.updateBalance(2000000000000000000000, 101);

      expect(updated.balance).toBe(2000000000000000000000);
      expect(updated.blockNumber).toBe(101);
      // 时间戳可能相同，因为是连续操作
      expect(updated.lastUpdated).toBeDefined();
    });

    it('should add balance correctly', () => {
      const updated = balance.addBalance(500000000000000000000, 101);

      expect(updated.balance).toBe(1500000000000000000000);
      expect(updated.blockNumber).toBe(101);
    });

    it('should subtract balance correctly', () => {
      const updated = balance.subtractBalance(300000000000000000000, 101);

      expect(updated.balance).toBe(700000000000000000000);
      expect(updated.blockNumber).toBe(101);
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON correctly', () => {
      const balance = AddressBalance.create(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        'ETH_ETH',
        1000000000000000000000,
        12345
      );

      const json = balance.toJSON();

      expect(json.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
      expect(json.coinKey).toBe('ETH_ETH');
      expect(json.balance).toBe(1000000000000000000000);
      expect(json.blockNumber).toBe(12345);
      expect(json.lastUpdated).toBe(balance.lastUpdated);
    });

    it('should create from JSON correctly', () => {
      const json: AddressBalanceJSON = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: '2023-01-01T00:00:00.000Z',
        blockNumber: 12345
      };

      const balance = AddressBalance.fromJSON(json);

      expect(balance.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
      expect(balance.coinKey).toBe('ETH_ETH');
      expect(balance.balance).toBe(1000000000000000000000);
      expect(balance.blockNumber).toBe(12345);
      expect(balance.lastUpdated).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('Utility Methods', () => {
    let balance: AddressBalance;

    beforeEach(() => {
      balance = AddressBalance.create(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        'ETH_ETH',
        1000000000000000000000,
        12345
      );
    });

    it('should get unique ID correctly', () => {
      const uniqueId = balance.getUniqueId();
      expect(uniqueId).toBe('ETH_ETH_0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
    });

    it('should get age correctly', () => {
      const age = balance.getAge();
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1000); // Should be very recent
    });

    it('should check if stale correctly', () => {
      expect(balance.isStale()).toBe(false); // Fresh balance
      
      const oldTimestamp = new Date(Date.now() - 400000).toISOString(); // More than 5 minutes ago
      const oldBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: oldTimestamp
      });
      
      expect(oldBalance.isStale()).toBe(true);
      expect(oldBalance.isStale(600000)).toBe(false); // Not stale with 10 minute threshold
    });
  });

  describe('Validation', () => {
    it('should throw error for empty address', () => {
      expect(() => new AddressBalance({
        address: '',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: new Date().toISOString()
      })).toThrow('Address is required');
    });

    it('should throw error for empty coin key', () => {
      expect(() => new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: '',
        balance: 1000000000000000000000,
        lastUpdated: new Date().toISOString()
      })).toThrow('Coin key is required');
    });

    it('should throw error for invalid balance', () => {
      expect(() => new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: NaN,
        lastUpdated: new Date().toISOString()
      })).toThrow('Balance must be a valid number');
    });

    it('should throw error for empty timestamp', () => {
      expect(() => new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: ''
      })).toThrow('Last updated timestamp is required');
    });

    it('should throw error for invalid timestamp', () => {
      expect(() => new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: 'invalid-timestamp'
      })).toThrow('Last updated must be a valid ISO timestamp');
    });

    it('should throw error for negative block number', () => {
      expect(() => new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: new Date().toISOString(),
        blockNumber: -1
      })).toThrow('Block number must be a positive number');
    });
  });

  describe('Utility Functions', () => {
    describe('isValidAddress', () => {
      it('should validate valid addresses', () => {
        expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(true);
        expect(isValidAddress('1234567890123456789012345678901234567890')).toBe(true);
      });

      it('should reject invalid addresses', () => {
        expect(isValidAddress('')).toBe(false);
        expect(isValidAddress('   ')).toBe(false);
        expect(isValidAddress(null as any)).toBe(false);
        expect(isValidAddress(undefined as any)).toBe(false);
      });
    });

    describe('isValidCoinKey', () => {
      it('should validate valid coin keys', () => {
        expect(isValidCoinKey('ETH_ETH')).toBe(true);
        expect(isValidCoinKey('ETH_USDT')).toBe(true);
        expect(isValidCoinKey('SOLANA_SOL')).toBe(true);
      });

      it('should reject invalid coin keys', () => {
        expect(isValidCoinKey('')).toBe(false);
        expect(isValidCoinKey('   ')).toBe(false);
        expect(isValidCoinKey(null as any)).toBe(false);
        expect(isValidCoinKey(undefined as any)).toBe(false);
      });
    });

    describe('isValidBalance', () => {
      it('should validate valid balances', () => {
        expect(isValidBalance(0)).toBe(true);
        expect(isValidBalance(1000000000000000000000)).toBe(true);
        expect(isValidBalance(-1000000000000000000000)).toBe(true);
      });

      it('should reject invalid balances', () => {
        expect(isValidBalance(NaN)).toBe(false);
        expect(isValidBalance(Infinity)).toBe(false);
        expect(isValidBalance(-Infinity)).toBe(false);
        expect(isValidBalance('string' as any)).toBe(false);
        expect(isValidBalance(null as any)).toBe(false);
        expect(isValidBalance(undefined as any)).toBe(false);
      });
    });

    describe('isValidTimestamp', () => {
      it('should validate valid timestamps', () => {
        expect(isValidTimestamp('2023-01-01T00:00:00.000Z')).toBe(true);
        expect(isValidTimestamp(new Date().toISOString())).toBe(true);
      });

      it('should reject invalid timestamps', () => {
        expect(isValidTimestamp('')).toBe(false);
        expect(isValidTimestamp('invalid-timestamp')).toBe(false);
        expect(isValidTimestamp(null as any)).toBe(false);
        expect(isValidTimestamp(undefined as any)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large balances', () => {
      const largeBalance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: Number.MAX_SAFE_INTEGER,
        lastUpdated: new Date().toISOString()
      });

      expect(largeBalance.isPositive()).toBe(true);
      expect(largeBalance.getFormattedBalance()).toBeDefined();
    });

    it('should handle zero timestamp correctly', () => {
      const balance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: new Date(0).toISOString()
      });

      expect(balance.lastUpdated).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle maximum block number', () => {
      const balance = new AddressBalance({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        coinKey: 'ETH_ETH',
        balance: 1000000000000000000000,
        lastUpdated: new Date().toISOString(),
        blockNumber: Number.MAX_SAFE_INTEGER
      });

      expect(balance.isAtBlock(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(balance.isAfterBlock(Number.MAX_SAFE_INTEGER - 1)).toBe(true);
    });
  });
});
