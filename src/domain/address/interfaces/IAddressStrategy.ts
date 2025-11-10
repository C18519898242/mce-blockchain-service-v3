/**
 * Address Strategy Interface
 * Defines the contract for blockchain-specific address operations
 * Follows Strategy Pattern to comply with Open-Closed Principle
 */

export interface IAddressStrategy {
  readonly blockchain: string;
  
  /**
   * Generate address from public key
   */
  generateAddress(publicKey: string): string;
  
  /**
   * Validate address format for this blockchain
   */
  validateAddress(address: string): boolean;
  
  /**
   * Format address for display
   */
  formatAddress(address: string): string;
  
  /**
   * Get the address format type
   */
  getFormat(): AddressFormat;
  
  /**
   * Get address length constraints
   */
  getLength(): { min: number; max: number };
  
  /**
   * Get address prefix
   */
  getPrefix(): string;
  
  /**
   * Validate public key format for this blockchain
   */
  validatePublicKey(publicKey: string): boolean;
}

export enum AddressFormat {
  ETHEREUM = 'ethereum',      // 0x...
  SOLANA = 'solana',        // Base58 with 1-44 chars
  BITCOIN = 'bitcoin',       // Base58 with 26-35 chars, starts with 1/3/bc1
  TRON = 'tron',            // Base58 with 34 chars, starts with T
  BSC = 'bsc'              // Same as Ethereum format
}
