import { Blockchain } from '../../blockchain/Blockchain';
import { AddressFormat } from '../types/AddressFormat';

/**
 * Address Strategy Interface
 * Defines the contract for blockchain-specific address operations
 * Follows Strategy Pattern to comply with Open-Closed Principle
 */

export interface IAddressStrategy {
  readonly blockchain: Blockchain;
  
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
