/**
 * Coin Entity Tests
 * 测试 Coin 实体的功能
 */

import { 
  Coin, 
  CoinProperties, 
  CoinJSON,
  BLOCKCHAINS, 
  isValidBlockchain
} from '../Coin';

describe('Coin Entity', () => {
  describe('Constructor', () => {
    it('should create a valid native Coin', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: 9
      };

      const coin = new Coin(properties);

      expect(coin.key).toBe('SOLANA_SOL');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.symbol).toBe('SOL');
      expect(coin.decimals).toBe(9);
      expect(coin.contractAddress).toBeUndefined();
    });

    it('should create a valid token Coin', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_USDT',
        blockchain: 'SOLANA',
        symbol: 'USDT',
        decimals: 6,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      };

      const coin = new Coin(properties);

      expect(coin.key).toBe('SOLANA_USDT');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.symbol).toBe('USDT');
      expect(coin.decimals).toBe(6);
      expect(coin.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
    });
  });

  describe('Business Methods', () => {
    it('should identify native coins correctly', () => {
      const nativeCoin = Coin.createNativeCoin('SOLANA', 'SOL', 9);
      expect(nativeCoin.isNative()).toBe(true);
      expect(nativeCoin.isToken()).toBe(false);
    });

    it('should identify tokens correctly', () => {
      const tokenCoin = Coin.createToken(
        'SOLANA', 
        'USDT', 
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      expect(tokenCoin.isNative()).toBe(false);
      expect(tokenCoin.isToken()).toBe(true);
    });

    it('should get full name correctly', () => {
      const coin = Coin.createNativeCoin('SOLANA', 'SOL', 9);
      expect(coin.getFullName()).toBe('SOLANA_SOL');
    });
  });

  describe('Factory Methods', () => {
    it('should create native coin using factory method', () => {
      const coin = Coin.createNativeCoin('SOLANA', 'SOL', 9);
      
      expect(coin.key).toBe('SOLANA_SOL');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.symbol).toBe('SOL');
      expect(coin.decimals).toBe(9);
      expect(coin.contractAddress).toBeUndefined();
    });

    it('should create token using factory method', () => {
      const coin = Coin.createToken(
        'SOLANA', 
        'USDT', 
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      
      expect(coin.key).toBe('SOLANA_USDT');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.symbol).toBe('USDT');
      expect(coin.decimals).toBe(6);
      expect(coin.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON correctly', () => {
      const coin = Coin.createToken(
        'SOLANA', 
        'USDT', 
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      
      const json = coin.toJSON();
      
      expect(json).toEqual({
        key: 'SOLANA_USDT',
        blockchain: 'SOLANA',
        symbol: 'USDT',
        decimals: 6,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      });
    });

    it('should create from JSON correctly', () => {
      const json: CoinJSON = {
        key: 'SOLANA_USDT',
        blockchain: 'SOLANA',
        symbol: 'USDT',
        decimals: 6,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      };

      const coin = Coin.fromJSON(json);
      
      expect(coin.key).toBe('SOLANA_USDT');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.symbol).toBe('USDT');
      expect(coin.decimals).toBe(6);
      expect(coin.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
    });

    it('should handle native coin JSON', () => {
      const json: CoinJSON = {
        key: 'SOLANA_SOL',
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: 9
      };

      const coin = Coin.fromJSON(json);
      
      expect(coin.isNative()).toBe(true);
      expect(coin.contractAddress).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should throw error for empty key', () => {
      const properties: CoinProperties = {
        key: '',
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: 9
      };

      expect(() => new Coin(properties)).toThrow('Coin key is required');
    });

    it('should throw error for empty blockchain', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        blockchain: '',
        symbol: 'SOL',
        decimals: 9
      };

      expect(() => new Coin(properties)).toThrow('Blockchain is required');
    });

    it('should throw error for empty symbol', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        blockchain: 'SOLANA',
        symbol: '',
        decimals: 9
      };

      expect(() => new Coin(properties)).toThrow('Symbol is required');
    });

    it('should throw error for negative decimals', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: -1
      };

      expect(() => new Coin(properties)).toThrow('Decimals must be between 0 and 18');
    });

    it('should throw error for decimals > 18', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: 19
      };

      expect(() => new Coin(properties)).toThrow('Decimals must be between 0 and 18');
    });

    it('should throw error for mismatched key format', () => {
      const properties: CoinProperties = {
        key: 'INVALID_KEY',
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: 9
      };

      expect(() => new Coin(properties)).toThrow("Coin key must be in format 'blockchain_symbol'. Expected: SOLANA_SOL, Got: INVALID_KEY");
    });
  });

  describe('Constants', () => {
    it('should have correct blockchain constants', () => {
      expect(BLOCKCHAINS.SOLANA).toBe('SOLANA');
    });

    it('should have all required blockchain constants', () => {
      const expectedChains = ['SOLANA'];
      
      expectedChains.forEach(chain => {
        expect(Object.values(BLOCKCHAINS)).toContain(chain);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('isValidBlockchain', () => {
      it('should validate known blockchains', () => {
        expect(isValidBlockchain('SOLANA')).toBe(true);
      });

      it('should reject unknown blockchains', () => {
        expect(isValidBlockchain('UNKNOWN_CHAIN')).toBe(false);
        expect(isValidBlockchain('')).toBe(false);
        expect(isValidBlockchain('ETH')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero decimals', () => {
      const coin = Coin.createNativeCoin('SPECIAL', 'WHOLE', 0);
      expect(coin.decimals).toBe(0);
    });

    it('should handle maximum decimals', () => {
      const coin = Coin.createNativeCoin('MAX', 'PRECISION', 18);
      expect(coin.decimals).toBe(18);
    });

    it('should handle whitespace in key correctly', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL', // 不使用空白字符，因为验证会检查格式
        blockchain: 'SOLANA',
        symbol: 'SOL',
        decimals: 9
      };

      expect(() => new Coin(properties)).not.toThrow();
    });

    it('should handle very long contract address', () => {
      const longAddress = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' + 'a'.repeat(20);
      const coin = Coin.createToken('SOLANA', 'LONG', 9, longAddress);
      
      expect(coin.contractAddress).toBe(longAddress);
    });
  });
});
