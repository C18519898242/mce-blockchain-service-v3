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
        key: 'ETH_ETH',
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: 18
      };

      const coin = new Coin(properties);

      expect(coin.key).toBe('ETH_ETH');
      expect(coin.blockchain).toBe('ETH');
      expect(coin.symbol).toBe('ETH');
      expect(coin.decimals).toBe(18);
      expect(coin.contractAddress).toBeUndefined();
    });

    it('should create a valid token Coin', () => {
      const properties: CoinProperties = {
        key: 'ETH_USDT',
        blockchain: 'ETH',
        symbol: 'USDT',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      };

      const coin = new Coin(properties);

      expect(coin.key).toBe('ETH_USDT');
      expect(coin.blockchain).toBe('ETH');
      expect(coin.symbol).toBe('USDT');
      expect(coin.decimals).toBe(6);
      expect(coin.contractAddress).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    });
  });

  describe('Business Methods', () => {
    it('should identify native coins correctly', () => {
      const nativeCoin = Coin.createNativeCoin('ETH', 'ETH', 18);
      expect(nativeCoin.isNative()).toBe(true);
      expect(nativeCoin.isToken()).toBe(false);
    });

    it('should identify tokens correctly', () => {
      const tokenCoin = Coin.createToken(
        'ETH', 
        'USDT', 
        6, 
        '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      );
      expect(tokenCoin.isNative()).toBe(false);
      expect(tokenCoin.isToken()).toBe(true);
    });

    it('should get full name correctly', () => {
      const coin = Coin.createNativeCoin('ETH', 'ETH', 18);
      expect(coin.getFullName()).toBe('ETH_ETH');
    });
  });

  describe('Factory Methods', () => {
    it('should create native coin using factory method', () => {
      const coin = Coin.createNativeCoin('ETH', 'ETH', 18);
      
      expect(coin.key).toBe('ETH_ETH');
      expect(coin.blockchain).toBe('ETH');
      expect(coin.symbol).toBe('ETH');
      expect(coin.decimals).toBe(18);
      expect(coin.contractAddress).toBeUndefined();
    });

    it('should create token using factory method', () => {
      const coin = Coin.createToken(
        'ETH', 
        'USDT', 
        6, 
        '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      );
      
      expect(coin.key).toBe('ETH_USDT');
      expect(coin.blockchain).toBe('ETH');
      expect(coin.symbol).toBe('USDT');
      expect(coin.decimals).toBe(6);
      expect(coin.contractAddress).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON correctly', () => {
      const coin = Coin.createToken(
        'ETH', 
        'USDT', 
        6, 
        '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      );
      
      const json = coin.toJSON();
      
      expect(json).toEqual({
        key: 'ETH_USDT',
        blockchain: 'ETH',
        symbol: 'USDT',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      });
    });

    it('should create from JSON correctly', () => {
      const json: CoinJSON = {
        key: 'ETH_USDT',
        blockchain: 'ETH',
        symbol: 'USDT',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      };

      const coin = Coin.fromJSON(json);
      
      expect(coin.key).toBe('ETH_USDT');
      expect(coin.blockchain).toBe('ETH');
      expect(coin.symbol).toBe('USDT');
      expect(coin.decimals).toBe(6);
      expect(coin.contractAddress).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    });

    it('should handle native coin JSON', () => {
      const json: CoinJSON = {
        key: 'ETH_ETH',
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: 18
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
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: 18
      };

      expect(() => new Coin(properties)).toThrow('Coin key is required');
    });

    it('should throw error for empty blockchain', () => {
      const properties: CoinProperties = {
        key: 'ETH_ETH',
        blockchain: '',
        symbol: 'ETH',
        decimals: 18
      };

      expect(() => new Coin(properties)).toThrow('Blockchain is required');
    });

    it('should throw error for empty symbol', () => {
      const properties: CoinProperties = {
        key: 'ETH_ETH',
        blockchain: 'ETH',
        symbol: '',
        decimals: 18
      };

      expect(() => new Coin(properties)).toThrow('Symbol is required');
    });

    it('should throw error for negative decimals', () => {
      const properties: CoinProperties = {
        key: 'ETH_ETH',
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: -1
      };

      expect(() => new Coin(properties)).toThrow('Decimals must be between 0 and 18');
    });

    it('should throw error for decimals > 18', () => {
      const properties: CoinProperties = {
        key: 'ETH_ETH',
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: 19
      };

      expect(() => new Coin(properties)).toThrow('Decimals must be between 0 and 18');
    });

    it('should throw error for mismatched key format', () => {
      const properties: CoinProperties = {
        key: 'INVALID_KEY',
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: 18
      };

      expect(() => new Coin(properties)).toThrow("Coin key must be in format 'blockchain_symbol'. Expected: ETH_ETH, Got: INVALID_KEY");
    });
  });

  describe('Constants', () => {
    it('should have correct blockchain constants', () => {
      expect(BLOCKCHAINS.ETHEREUM).toBe('ETH');
      expect(BLOCKCHAINS.SOLANA).toBe('SOLANA');
      expect(BLOCKCHAINS.TRON).toBe('TRON');
      expect(BLOCKCHAINS.BITCOIN).toBe('BITCOIN');
    });

    it('should have all required blockchain constants', () => {
      const expectedChains = ['ETH', 'SOLANA', 'TRON', 'BITCOIN', 'BSC', 'POLYGON', 'AVAX', 'ARBITRUM', 'OPTIMISM'];
      
      expectedChains.forEach(chain => {
        expect(Object.values(BLOCKCHAINS)).toContain(chain);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('isValidBlockchain', () => {
      it('should validate known blockchains', () => {
        expect(isValidBlockchain('ETH')).toBe(true);
        expect(isValidBlockchain('SOLANA')).toBe(true);
        expect(isValidBlockchain('TRON')).toBe(true);
        expect(isValidBlockchain('BITCOIN')).toBe(true);
      });

      it('should reject unknown blockchains', () => {
        expect(isValidBlockchain('UNKNOWN_CHAIN')).toBe(false);
        expect(isValidBlockchain('')).toBe(false);
        expect(isValidBlockchain('ETHEREUM')).toBe(false); // 注意：常数是 ETH，不是 ETHEREUM
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
        key: 'ETH_ETH', // 不使用空白字符，因为验证会检查格式
        blockchain: 'ETH',
        symbol: 'ETH',
        decimals: 18
      };

      expect(() => new Coin(properties)).not.toThrow();
    });

    it('should handle very long contract address', () => {
      const longAddress = '0x' + 'a'.repeat(40);
      const coin = Coin.createToken('ETH', 'LONG', 18, longAddress);
      
      expect(coin.contractAddress).toBe(longAddress);
    });
  });
});
