import { Coin } from '../coin/Coin';
import { BLOCKCHAINS } from './blockchain.constants';

/**
 * Blockchain Adapter Interface
 * 
 * Defines the contract for blockchain operations across different blockchain networks.
 * This interface provides a unified way to interact with various blockchains
 * while maintaining consistency in the application layer.
 */
export interface IBlockchainAdapter {
  /**
   * Get the balance of a specific coin for a given address
   * 
   * @param address The blockchain address to query balance for
   * @param coin The coin configuration containing blockchain and contract details
   * @returns Promise resolving to the balance amount in the smallest unit (wei, lamports, etc.)
   */
  getBalance(address: string, coin: Coin): Promise<number>;

  /**
   * Get the latest block number from the blockchain
   * 
   * @returns Promise resolving to the current block number
   */
  getLatestBlockNumber(): Promise<number>;

  /**
   * Validate if an address format is correct for the blockchain
   * 
   * @param address The address to validate
   * @returns True if address format is valid, false otherwise
   */
  validateAddress(address: string): boolean;

  /**
   * Generate a blockchain address from a public key
   * 
   * @param publicKey The public key to generate address from
   * @returns The generated blockchain address
   */
  generateAddressFromPublicKey(publicKey: string): string;
}
