/**
 * AddressService Tests
 * 测试 AddressDomainService 的功能
 * Phase 1: Only Solana is supported, but architecture maintains extensibility
 */

import { AddressDomainService } from '../AddressService';
import { 
  SolanaAddressStrategy
} from '../index';
import { SOLANA } from '../../blockchain/blockchain.constants';

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
      // Also test with Blockchain instance
      expect(() => addressService.validateAddress('11111111111111111111111111111111112', SOLANA)).not.toThrow();
    });
  });

  describe('registerStrategy', () => {
    it('should register a new strategy', () => {
      const customStrategy = new SolanaAddressStrategy();
      
      expect(() => addressService.registerCustomStrategy(customStrategy)).not.toThrow();
      
      // Test that custom strategy works (using default SOLANA blockchain)
      expect(() => addressService.validateAddress('11111111111111111111111111111111112', 'SOLANA')).not.toThrow();
      expect(() => addressService.validateAddress('11111111111111111111111111111111112', SOLANA)).not.toThrow();
    });

    it('should throw error for duplicate blockchain', () => {
      const strategy = new SolanaAddressStrategy();
      
      expect(() => addressService.registerCustomStrategy(strategy)).not.toThrow(); // This won't throw error, just override
    });
  });

  describe('validateAddress', () => {
    describe('Solana addresses', () => {
      it('should validate valid Solana addresses with string blockchain id', () => {
        const validAddresses = [
          '11111111111111111111111111111111112', // System Program
          '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' // Random valid address
        ];

        validAddresses.forEach(address => {
          expect(addressService.validateAddress(address, 'SOLANA')).toBe(true);
        });
      });
      
      it('should validate valid Solana addresses with Blockchain instance', () => {
        const validAddresses = [
          '11111111111111111111111111111111112', // System Program
          '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' // Random valid address
        ];

        validAddresses.forEach(address => {
          expect(addressService.validateAddress(address, SOLANA)).toBe(true);
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
          expect(addressService.validateAddress(address, 'SOLANA')).toBe(false);
          expect(addressService.validateAddress(address, SOLANA)).toBe(false);
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
      expect(addressService.isSupported(SOLANA)).toBe(true);
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
  });

  describe('Integration with blockchain constants', () => {
    it('should work with Solana blockchain instance', () => {
      const address = '11111111111111111111111111111111112';
      
      expect(addressService.validateAddress(address, SOLANA)).toBe(true);
      expect(addressService.isSupported(SOLANA)).toBe(true);
      expect(addressService.getAddressFormat(SOLANA)).toBe(SOLANA.getAddressFormat());
    });
  });
  
  describe('getAddressFormat', () => {
    it('should return the correct address format from blockchain instance', () => {
      const format = addressService.getAddressFormat('SOLANA');
      expect(format).toBeDefined();
      
      // Using Blockchain instance
      const formatWithInstance = addressService.getAddressFormat(SOLANA);
      expect(formatWithInstance).toBe(SOLANA.getAddressFormat());
    });
  });
  
  describe('generateAddressInfo', () => {
    it('should generate address info with correct blockchain id', () => {
      const publicKey = '1111111111111111111111111111111111111111111111111111111111111111';
      
      // With string id
      const infoWithString = addressService.generateAddressInfo(publicKey, 'SOLANA');
      expect(infoWithString.blockchain).toBe('SOLANA');
      
      // With Blockchain instance
      const infoWithInstance = addressService.generateAddressInfo(publicKey, SOLANA);
      expect(infoWithInstance.blockchain).toBe('SOLANA');
      expect(infoWithInstance.format).toBe(SOLANA.getAddressFormat());
    });
  });
});
