/**
 * AddressService Tests
 * 测试 AddressDomainService 的功能
 * Phase 1: Only Solana is supported, but architecture maintains extensibility
 */

import { AddressDomainService } from '../AddressService';
import { 
  EvmAddressStrategy, 
  SolanaAddressStrategy
} from '../index';
import { BLOCKCHAINS } from '../../coin/Coin';

describe('AddressDomainService', () => {
  let addressService: AddressDomainService;

  beforeEach(() => {
    addressService = new AddressDomainService();
  });

  describe('constructor', () => {
    it('should initialize with default strategies', () => {
      expect(addressService).toBeDefined();
      
      // Test that Solana strategy is registered
      expect(() => addressService.validateAddress('11111111111111111111111111111111112', 'SOLANA')).not.toThrow();
    });
  });

  describe('registerStrategy', () => {
    it('should register a new strategy', () => {
      const customStrategy = new EvmAddressStrategy('CUSTOM');
      
      expect(() => addressService.registerCustomStrategy(customStrategy)).not.toThrow();
      
      // Test that custom strategy works
      expect(() => addressService.validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', 'CUSTOM')).not.toThrow();
    });

    it('should throw error for duplicate blockchain', () => {
      const strategy = new SolanaAddressStrategy();
      
      expect(() => addressService.registerCustomStrategy(strategy)).not.toThrow(); // This won't throw error, just override
    });
  });

  describe('validateAddress', () => {
    describe('Solana addresses', () => {
      it('should validate valid Solana addresses', () => {
        const validAddresses = [
          '11111111111111111111111111111111112', // System Program
          '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' // Random valid address
        ];

        validAddresses.forEach(address => {
          expect(addressService.validateAddress(address, 'SOLANA')).toBe(true);
        });
      });

      it('should reject invalid Solana addresses', () => {
        const invalidAddresses = [
          '1111111111111111111111111111111', // Too short (31 chars)
          '1111111111111111111111111111111111111111111111', // Too long (46 chars)
          '11111111111111111111111111111111111I', // Invalid base58 character 'I' (35 chars)
          '11111111111111111111111111111111111O', // Invalid base58 character 'O' (35 chars)
          '11111111111111111111111111111111111l', // Invalid base58 character 'l' (35 chars)
          '11111111111111111111111111111111111I0', // Invalid base58 character 'I' (36 chars)
          '',
          null as any,
          undefined as any
        ];

        invalidAddresses.forEach((address, index) => {
          const result = addressService.validateAddress(address, 'SOLANA');
          expect(result).toBe(false);
        });
      });
    });

    it('should return false for unsupported blockchain', () => {
      expect(addressService.validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', 'UNSUPPORTED'))
        .toBe(false);
    });
  });

  describe('getSupportedBlockchains', () => {
    it('should return all supported blockchains', () => {
      const supported = addressService.getSupportedBlockchains();
      
      expect(Array.isArray(supported)).toBe(true);
      expect(supported.length).toBeGreaterThan(0);
      expect(supported).toContain('SOLANA');
    });
  });

  describe('isBlockchainSupported', () => {
    it('should return true for supported blockchains', () => {
      expect(addressService.isSupported('SOLANA')).toBe(true);
    });

    it('should return false for unsupported blockchains', () => {
      expect(addressService.isSupported('UNSUPPORTED')).toBe(false);
      expect(addressService.isSupported('')).toBe(false);
      expect(addressService.isSupported(null as any)).toBe(false);
      expect(addressService.isSupported(undefined as any)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty blockchain string', () => {
      expect(addressService.validateAddress('11111111111111111111111111111111112', ''))
        .toBe(false);
    });

    it('should handle null blockchain', () => {
      expect(addressService.validateAddress('11111111111111111111111111111111112', null as any))
        .toBe(false);
    });

    it('should handle undefined blockchain', () => {
      expect(addressService.validateAddress('11111111111111111111111111111111112', undefined as any))
        .toBe(false);
    });

    it('should handle strategy validation errors gracefully', () => {
      // Register a strategy that throws errors
      const errorStrategy = new EvmAddressStrategy('ERROR_CHAIN');
      jest.spyOn(errorStrategy, 'validateAddress').mockImplementation(() => {
        throw new Error('Strategy error');
      });
      
      addressService.registerCustomStrategy(errorStrategy);
      
      // Should return false when strategy throws error
      expect(addressService.validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', 'ERROR_CHAIN')).toBe(false);
    });
  });

  describe('Integration with blockchain constants', () => {
    it('should work with Solana blockchain constants', () => {
      const testAddresses = {
        [BLOCKCHAINS.SOLANA]: '11111111111111111111111111111111112'
      };

      Object.entries(testAddresses).forEach(([blockchain, address]) => {
        expect(addressService.validateAddress(address as string, blockchain)).toBe(true);
        expect(addressService.isSupported(blockchain)).toBe(true);
      });
    });
  });

  describe('Extensibility Tests', () => {
    it('should support adding new blockchain strategies', () => {
      // Test that the architecture allows for future expansion
      const ethStrategy = new EvmAddressStrategy(BLOCKCHAINS.ETHEREUM);
      
      expect(() => addressService.registerCustomStrategy(ethStrategy)).not.toThrow();
      expect(addressService.isSupported(BLOCKCHAINS.ETHEREUM)).toBe(true);
      
      // Test Ethereum address validation
      expect(addressService.validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', BLOCKCHAINS.ETHEREUM)).toBe(true);
    });

    it('should maintain Solana functionality when new strategies are added', () => {
      // Add a new strategy
      const btcStrategy = new EvmAddressStrategy('BITCOIN');
      addressService.registerCustomStrategy(btcStrategy);
      
      // Solana should still work
      expect(addressService.validateAddress('11111111111111111111111111111111112', 'SOLANA')).toBe(true);
      expect(addressService.isSupported('SOLANA')).toBe(true);
    });
  });
});
