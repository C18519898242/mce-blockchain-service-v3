/**
 * Coin Entity Tests
 * 测试 Coin 实体的功能
 */

import { 
  Coin, 
  CoinProperties, 
  CoinJSON,
  BLOCKCHAINS, 
  NETWORKS,
  COIN_TYPES,
  isValidBlockchain,
  isValidNetwork,
  isValidCoinType
} from '../Coin';

describe('Coin Entity', () => {
  describe('Constructor', () => {
    it('should create a valid native Coin', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      const coin = new Coin(properties);

      expect(coin.key).toBe('SOLANA_SOL');
      expect(coin.name).toBe('Solana');
      expect(coin.network).toBe('mainnet');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.type).toBe('native');
      expect(coin.decimal).toBe(9);
      expect(coin.fullName).toBe('Solana on SOLANA');
      expect(coin.confirmCount).toBe(32);
      expect(coin.contractAddress).toBeUndefined();
    });

    it('should create a valid token Coin', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        confirmCount: 32,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        addressRefUrl: 'https://solscan.io/account/{address}',
        txRefUrl: 'https://solscan.io/tx/{txHash}',
        tokenIdentifier: 'USDT',
        chainId: 'mainnet-beta'
      };

      const coin = new Coin(properties);

      expect(coin.key).toBe('SOLANA_USDT');
      expect(coin.name).toBe('Tether USD');
      expect(coin.network).toBe('mainnet');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.type).toBe('token');
      expect(coin.decimal).toBe(6);
      expect(coin.fullName).toBe('Tether USD on SOLANA');
      expect(coin.confirmCount).toBe(32);
      expect(coin.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
      expect(coin.addressRefUrl).toBe('https://solscan.io/account/{address}');
      expect(coin.txRefUrl).toBe('https://solscan.io/tx/{txHash}');
      expect(coin.tokenIdentifier).toBe('USDT');
      expect(coin.chainId).toBe('mainnet-beta');
    });

    it('should create a testnet token Coin', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'testnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        confirmCount: 32,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        testKey: 'TEST_USDT'
      };

      const coin = new Coin(properties);

      expect(coin.isTestnet()).toBe(true);
      expect(coin.isMainnet()).toBe(false);
      expect(coin.testKey).toBe('TEST_USDT');
    });
  });

  describe('Business Methods', () => {
    it('should identify native coins correctly', () => {
      const nativeCoin = Coin.createNativeCoin('SOL', 'Solana');
      expect(nativeCoin.isNative()).toBe(true);
      expect(nativeCoin.isToken()).toBe(false);
    });

    it('should identify tokens correctly', () => {
      const tokenCoin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      expect(tokenCoin.isNative()).toBe(false);
      expect(tokenCoin.isToken()).toBe(true);
    });

    it('should identify testnet and mainnet correctly', () => {
      const mainnetCoin = Coin.createNativeCoin('SOL', 'Solana', 'mainnet');
      const testnetCoin = Coin.createNativeCoin('SOL', 'Solana', 'testnet');

      expect(mainnetCoin.isMainnet()).toBe(true);
      expect(mainnetCoin.isTestnet()).toBe(false);
      expect(testnetCoin.isMainnet()).toBe(false);
      expect(testnetCoin.isTestnet()).toBe(true);
    });

    it('should get full name correctly', () => {
      const coin = Coin.createNativeCoin('SOL', 'Solana');
      expect(coin.getFullName()).toBe('Solana on SOLANA');
    });

    it('should get address reference URL correctly', () => {
      const coin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'mainnet',
        32,
        {
          addressRefUrl: 'https://solscan.io/account/{address}'
        }
      );

      expect(coin.getAddressRefUrl()).toBe('https://solscan.io/account/{address}');
      expect(coin.getAddressRefUrl('ABC123')).toBe('https://solscan.io/account/ABC123');
      expect(coin.getAddressRefUrl(undefined)).toBe('https://solscan.io/account/{address}');
    });

    it('should get transaction reference URL correctly', () => {
      const coin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'mainnet',
        32,
        {
          txRefUrl: 'https://solscan.io/tx/{txHash}'
        }
      );

      expect(coin.getTxRefUrl()).toBe('https://solscan.io/tx/{txHash}');
      expect(coin.getTxRefUrl('TX123')).toBe('https://solscan.io/tx/TX123');
      expect(coin.getTxRefUrl(undefined)).toBe('https://solscan.io/tx/{txHash}');
    });

    it('should handle missing URLs gracefully', () => {
      const coin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );

      expect(coin.getAddressRefUrl()).toBeUndefined();
      expect(coin.getTxRefUrl()).toBeUndefined();
    });
  });

  describe('Factory Methods', () => {
    it('should create native coin using factory method', () => {
      const coin = Coin.createNativeCoin('SOL', 'Solana');
      
      expect(coin.key).toBe('SOLANA_SOL');
      expect(coin.name).toBe('Solana');
      expect(coin.network).toBe('mainnet');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.type).toBe('native');
      expect(coin.decimal).toBe(9);
      expect(coin.fullName).toBe('Solana on SOLANA');
      expect(coin.confirmCount).toBe(32);
      expect(coin.contractAddress).toBeUndefined();
    });

    it('should create native coin with custom parameters', () => {
      const coin = Coin.createNativeCoin('SOL', 'Solana', 'testnet', 9, 64);
      
      expect(coin.network).toBe('testnet');
      expect(coin.decimal).toBe(9);
      expect(coin.confirmCount).toBe(64);
    });

    it('should create token using factory method', () => {
      const coin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      );
      
      expect(coin.key).toBe('SOLANA_USDT');
      expect(coin.name).toBe('Tether USD');
      expect(coin.network).toBe('mainnet');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.type).toBe('token');
      expect(coin.decimal).toBe(6);
      expect(coin.fullName).toBe('Tether USD on SOLANA');
      expect(coin.confirmCount).toBe(32);
      expect(coin.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
    });

    it('should create token with options', () => {
      const coin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'mainnet',
        32,
        {
          blockchainAlias: 'Solana',
          addressRefUrl: 'https://solscan.io/account/{address}',
          txRefUrl: 'https://solscan.io/tx/{txHash}',
          tokenIdentifier: 'USDT',
          chainId: 'mainnet-beta',
          testKey: 'TEST_USDT'
        }
      );
      
      expect(coin.blockchainAlias).toBe('Solana');
      expect(coin.addressRefUrl).toBe('https://solscan.io/account/{address}');
      expect(coin.txRefUrl).toBe('https://solscan.io/tx/{txHash}');
      expect(coin.tokenIdentifier).toBe('USDT');
      expect(coin.chainId).toBe('mainnet-beta');
      expect(coin.testKey).toBe('TEST_USDT');
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON correctly', () => {
      const coin = Coin.createToken(
        'USDT', 
        'Tether USD',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'mainnet',
        32,
        {
          addressRefUrl: 'https://solscan.io/account/{address}',
          txRefUrl: 'https://solscan.io/tx/{txHash}',
          tokenIdentifier: 'USDT',
          chainId: 'mainnet-beta'
        }
      );
      
      const json = coin.toJSON();
      
      expect(json).toEqual({
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        confirmCount: 32,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        addressRefUrl: 'https://solscan.io/account/{address}',
        txRefUrl: 'https://solscan.io/tx/{txHash}',
        tokenIdentifier: 'USDT',
        chainId: 'mainnet-beta'
      });
    });

    it('should create from JSON correctly', () => {
      const json: CoinJSON = {
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        confirmCount: 32,
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        addressRefUrl: 'https://solscan.io/account/{address}',
        txRefUrl: 'https://solscan.io/tx/{txHash}',
        tokenIdentifier: 'USDT',
        chainId: 'mainnet-beta'
      };

      const coin = Coin.fromJSON(json);
      
      expect(coin.key).toBe('SOLANA_USDT');
      expect(coin.name).toBe('Tether USD');
      expect(coin.network).toBe('mainnet');
      expect(coin.blockchain).toBe('SOLANA');
      expect(coin.type).toBe('token');
      expect(coin.decimal).toBe(6);
      expect(coin.fullName).toBe('Tether USD on SOLANA');
      expect(coin.confirmCount).toBe(32);
      expect(coin.contractAddress).toBe('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
      expect(coin.addressRefUrl).toBe('https://solscan.io/account/{address}');
      expect(coin.txRefUrl).toBe('https://solscan.io/tx/{txHash}');
      expect(coin.tokenIdentifier).toBe('USDT');
      expect(coin.chainId).toBe('mainnet-beta');
    });

    it('should handle native coin JSON', () => {
      const json: CoinJSON = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
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
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Coin key is required');
    });

    it('should throw error for empty name', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: '',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Coin name is required');
    });

    it('should throw error for empty network', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: '',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Network is required');
    });

    it('should throw error for non-Solana blockchain', () => {
      const properties: CoinProperties = {
        key: 'ETH_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'ETH',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on ETH',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Only Solana blockchain is supported');
    });

    it('should throw error for invalid coin type', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'invalid',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Coin type must be either "native" or "token"');
    });

    it('should throw error for empty full name', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: '',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Full name is required');
    });

    it('should throw error for negative decimal', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: -1,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Decimal must be between 0 and 18');
    });

    it('should throw error for decimal > 18', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 19,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Decimal must be between 0 and 18');
    });

    it('should throw error for negative confirm count', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: -1
      };

      expect(() => new Coin(properties)).toThrow('Confirm count must be non-negative');
    });

    it('should throw error for invalid network', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'invalid',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Network must be either "mainnet" or "testnet"');
    });

    it('should throw error for token without contract address', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_USDT',
        name: 'Tether USD',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'token',
        decimal: 6,
        fullName: 'Tether USD on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow('Contract address is required for tokens');
    });

    it('should throw error for native coin with contract address', () => {
      const properties: CoinProperties = {
        key: 'SOLANA_SOL',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32,
        contractAddress: 'invalid'
      };

      expect(() => new Coin(properties)).toThrow('Contract address should not be present for native coins');
    });

    it('should throw error for invalid key format', () => {
      const properties: CoinProperties = {
        key: 'INVALID_KEY',
        name: 'Solana',
        network: 'mainnet',
        blockchain: 'SOLANA',
        type: 'native',
        decimal: 9,
        fullName: 'Solana on SOLANA',
        confirmCount: 32
      };

      expect(() => new Coin(properties)).toThrow("Coin key must start with 'SOLANA_'. Got: INVALID_KEY");
    });
  });

  describe('Constants', () => {
    it('should have correct blockchain constants', () => {
      expect(BLOCKCHAINS.SOLANA).toBe('SOLANA');
      expect(Object.keys(BLOCKCHAINS)).toHaveLength(1);
    });

    it('should have correct network constants', () => {
      expect(NETWORKS.MAINNET).toBe('mainnet');
      expect(NETWORKS.TESTNET).toBe('testnet');
    });

    it('should have correct coin type constants', () => {
      expect(COIN_TYPES.NATIVE).toBe('native');
      expect(COIN_TYPES.TOKEN).toBe('token');
    });
  });

  describe('Utility Functions', () => {
    describe('isValidBlockchain', () => {
      it('should validate Solana blockchain', () => {
        expect(isValidBlockchain('SOLANA')).toBe(true);
      });

      it('should reject other blockchains', () => {
        expect(isValidBlockchain('ETH')).toBe(false);
        expect(isValidBlockchain('BTC')).toBe(false);
        expect(isValidBlockchain('TRON')).toBe(false);
        expect(isValidBlockchain('')).toBe(false);
      });
    });

    describe('isValidNetwork', () => {
      it('should validate known networks', () => {
        expect(isValidNetwork('mainnet')).toBe(true);
        expect(isValidNetwork('testnet')).toBe(true);
      });

      it('should reject unknown networks', () => {
        expect(isValidNetwork('')).toBe(false);
        expect(isValidNetwork('invalid')).toBe(false);
      });
    });

    describe('isValidCoinType', () => {
      it('should validate known coin types', () => {
        expect(isValidCoinType('native')).toBe(true);
        expect(isValidCoinType('token')).toBe(true);
      });

      it('should reject unknown coin types', () => {
        expect(isValidCoinType('')).toBe(false);
        expect(isValidCoinType('invalid')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero decimal', () => {
      const coin = Coin.createNativeCoin('WHOLE', 'Whole Token', 'mainnet', 0);
      expect(coin.decimal).toBe(0);
    });

    it('should handle maximum decimal', () => {
      const coin = Coin.createNativeCoin('PRECISION', 'Precision Token', 'mainnet', 18);
      expect(coin.decimal).toBe(18);
    });

    it('should handle zero confirm count', () => {
      const coin = Coin.createNativeCoin('NOCONFIRM', 'No Confirm Token', 'mainnet', 9, 0);
      expect(coin.confirmCount).toBe(0);
    });

    it('should handle very long contract address', () => {
      const longAddress = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' + 'a'.repeat(20);
      const coin = Coin.createToken('LONG', 'Long Address Token', 9, longAddress);
      
      expect(coin.contractAddress).toBe(longAddress);
    });

    it('should handle all optional fields', () => {
      const coin = Coin.createToken(
        'FULL', 
        'Full Feature Token',
        6, 
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'mainnet',
        32,
        {
          blockchainAlias: 'Solana Network',
          addressRefUrl: 'https://solscan.io/account/{address}',
          txRefUrl: 'https://solscan.io/tx/{txHash}',
          tokenIdentifier: 'FULL_TOKEN',
          chainId: 'mainnet-beta',
          testKey: 'TEST_FULL'
        }
      );

      expect(coin.blockchainAlias).toBe('Solana Network');
      expect(coin.addressRefUrl).toBe('https://solscan.io/account/{address}');
      expect(coin.txRefUrl).toBe('https://solscan.io/tx/{txHash}');
      expect(coin.tokenIdentifier).toBe('FULL_TOKEN');
      expect(coin.chainId).toBe('mainnet-beta');
      expect(coin.testKey).toBe('TEST_FULL');
    });
  });
});
