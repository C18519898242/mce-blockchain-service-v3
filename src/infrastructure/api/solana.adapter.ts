import { IBlockchainAdapter } from '../../domain/blockchain/IBlockchainAdapter';
import { Coin } from '../../domain/coin/Coin';

/**
 * Solana Blockchain Adapter - Mock Implementation
 * 
 * Mock implementation of Solana blockchain adapter for testing and development.
 * Returns predefined values without actual blockchain interaction.
 * Real implementation will be added later with @solana/web3.js integration.
 */
export class SolanaBlockchainAdapter implements IBlockchainAdapter {
  /**
   * Get balance for Solana address
   * 
   * Mock implementation that returns 0 for all addresses.
   * Real implementation will query Solana blockchain for actual balance.
   * 
   * @param address The Solana address to query balance for
   * @param coin The coin configuration (must be SOLANA blockchain)
   * @returns Promise resolving to 0 (mock balance)
   */
  async getBalance(address: string, coin: Coin): Promise<number> {
    // Mock implementation - always return 0
    // Real implementation will use @solana/web3.js to query actual balance
    return 0;
  }

  /**
   * Get latest block number from Solana
   * 
   * Mock implementation that returns a fixed block number.
   * Real implementation will query actual Solana network.
   * 
   * @returns Promise resolving to mock block number 123456
   */
  async getLatestBlockNumber(): Promise<number> {
    // Mock implementation - return fixed block number
    // Real implementation will query actual Solana network
    return 123456;
  }

  /**
   * Validate Solana address format
   * 
   * Mock implementation that performs basic validation.
   * Real implementation will validate actual Solana address format.
   * 
   * @param address The address to validate
   * @returns True if address appears valid, false otherwise
   */
  validateAddress(address: string): boolean {
    // Mock implementation - basic validation
    // Real implementation will validate actual Solana address format (base58, 32-44 chars)
    return address && address.length >= 32 && address.length <= 44;
  }

  /**
   * Generate Solana address from public key
   * 
   * Mock implementation that generates a mock address.
   * Real implementation will use Solana key derivation.
   * 
   * @param publicKey The public key to generate address from
   * @returns Mock Solana address
   */
  generateAddressFromPublicKey(publicKey: string): string {
    // Mock implementation - generate mock address
    // Real implementation will use actual Solana address derivation
    return `mock_solana_address_${publicKey.substring(0, 8)}`;
  }
}
