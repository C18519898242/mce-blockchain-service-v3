import { SolanaBlockchainAdapter } from '../solana.adapter';
import { Coin } from '@domain/coin/Coin';
import { Keypair } from '@solana/web3.js';

describe('SolanaBlockchainAdapter', () => {
  let adapter: SolanaBlockchainAdapter;
  let testCoin: Coin;

  beforeEach(() => {
    adapter = new SolanaBlockchainAdapter();
    testCoin = Coin.createNativeCoin('SOL', 'Solana', 'testnet');
  });

  describe('generateAddressFromPublicKey', () => {
    it('should generate valid Solana address from base58 public key', () => {
      // Generate a new EDDSA keypair using Solana SDK
      const keypair = Keypair.generate();
      const publicKeyBase58 = keypair.publicKey.toString();
      
      // Test address generation
      const generatedAddress = adapter.generateAddressFromPublicKey(publicKeyBase58);
      
      // The generated address should be the same as the public key in base58 format
      expect(generatedAddress).toBe(publicKeyBase58);
      expect(generatedAddress.length).toBeGreaterThan(30); // Solana addresses are ~44 chars
    });

    it('should generate valid Solana address from hex public key', () => {
      // Generate a new EDDSA keypair
      const keypair = Keypair.generate();
      const publicKeyBase58 = keypair.publicKey.toString();
      
      // Convert to hex format
      const publicKeyBytes = keypair.publicKey.toBytes();
      const publicKeyHex = Array.from(publicKeyBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Test address generation from hex
      const generatedAddress = adapter.generateAddressFromPublicKey(publicKeyHex);
      
      // Should convert hex to proper base58 Solana address
      expect(generatedAddress).toBe(publicKeyBase58);
    });

    it('should generate valid Solana address from hex public key with 0x prefix', () => {
      // Generate a new EDDSA keypair
      const keypair = Keypair.generate();
      const publicKeyBase58 = keypair.publicKey.toString();
      
      // Convert to hex format with 0x prefix
      const publicKeyBytes = keypair.publicKey.toBytes();
      const publicKeyHex = '0x' + Array.from(publicKeyBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Test address generation from hex with 0x prefix
      const generatedAddress = adapter.generateAddressFromPublicKey(publicKeyHex);
      
      // Should convert hex to proper base58 Solana address
      expect(generatedAddress).toBe(publicKeyBase58);
    });

    it('should throw error for invalid public key format', () => {
      // Test with invalid public key
      expect(() => {
        adapter.generateAddressFromPublicKey('invalid_public_key');
      }).toThrow('Invalid public key format');
    });

    it('should handle edge cases with empty string', () => {
      // Test with empty string
      expect(() => {
        adapter.generateAddressFromPublicKey('');
      }).toThrow('Invalid public key format');
    });

    it('should generate consistent addresses for the same public key', () => {
      // Generate a keypair
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      
      // Generate address multiple times
      const address1 = adapter.generateAddressFromPublicKey(publicKey);
      const address2 = adapter.generateAddressFromPublicKey(publicKey);
      const address3 = adapter.generateAddressFromPublicKey(publicKey);
      
      // All should be the same
      expect(address1).toBe(address2);
      expect(address2).toBe(address3);
    });
  });

  describe('EDDSA Keypair Generation Integration', () => {
    it('should successfully generate and use multiple EDDSA keypairs', () => {
      // Generate multiple keypairs to test the system with different keys
      const keypairs = Array.from({ length: 3 }, () => Keypair.generate());
      
      keypairs.forEach(keypair => {
        const publicKey = keypair.publicKey.toString();
        const generatedAddress = adapter.generateAddressFromPublicKey(publicKey);
        
        // Verify each generated address is valid
        expect(generatedAddress).toBeTruthy();
        expect(generatedAddress.length).toBeGreaterThan(30);
        
        // Verify the address can be validated by the adapter
        expect(adapter.validateAddress(generatedAddress)).toBe(true);
      });
    });
  });

  // Additional tests for other methods to ensure full coverage
  describe('getBalance', () => {
    it('should return 0 for mock balance', async () => {
      const address = 'mock_address';
      const balance = await adapter.getBalance(address, testCoin);
      expect(balance).toBe(0);
    });
  });

  describe('getLatestBlockNumber', () => {
    it('should return mock block number', async () => {
      const blockNumber = await adapter.getLatestBlockNumber();
      expect(blockNumber).toBe(123456);
    });
  });

  describe('validateAddress', () => {
    it('should validate valid Solana address format', () => {
      const keypair = Keypair.generate();
      const validAddress = keypair.publicKey.toString();
      expect(adapter.validateAddress(validAddress)).toBe(true);
    });

    it('should invalidate addresses that are too short', () => {
      expect(adapter.validateAddress('too_short')).toBe(false);
    });

    it('should invalidate addresses that are too long', () => {
      const longAddress = 'a'.repeat(50);
      expect(adapter.validateAddress(longAddress)).toBe(false);
    });

    it('should invalidate empty addresses', () => {
      expect(adapter.validateAddress('')).toBe(false);
      expect(adapter.validateAddress(null as any)).toBe(false);
      expect(adapter.validateAddress(undefined as any)).toBe(false);
    });
  });
});