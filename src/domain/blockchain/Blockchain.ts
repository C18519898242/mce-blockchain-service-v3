/**
 * Blockchain Entity
 * 
 * Represents a blockchain network with its properties.
 * AddressFormat is now a property of the blockchain to support
 * multiple blockchains sharing the same address format.
 */
import { AddressFormat } from '../address/types/AddressFormat';

export class Blockchain {
  /**
   * The unique identifier of the blockchain
   */
  private readonly id: string;

  /**
   * The human-readable name of the blockchain
   */
  private readonly name: string;

  /**
   * The address format used by this blockchain
   */
  private readonly addressFormat: AddressFormat;

  /**
   * Constructor
   * 
   * @param id The unique identifier of the blockchain
   * @param name The human-readable name of the blockchain
   * @param addressFormat The address format used by this blockchain
   */
  constructor(id: string, name: string, addressFormat: AddressFormat) {
    if (!id || !id.trim()) {
      throw new Error('Blockchain ID cannot be empty');
    }
    if (!name || !name.trim()) {
      throw new Error('Blockchain name cannot be empty');
    }
    if (!addressFormat) {
      throw new Error('Blockchain must have an address format');
    }

    this.id = id.toUpperCase();
    this.name = name;
    this.addressFormat = addressFormat;
  }

  /**
   * Get the blockchain ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get the blockchain name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Get the address format used by this blockchain
   */
  public getAddressFormat(): AddressFormat {
    return this.addressFormat;
  }

  /**
   * Check if this blockchain matches the provided ID or name
   * Supports matching by:
   * 1. Blockchain ID (case-insensitive)
   * 2. Blockchain name (case-insensitive)
   * 3. Blockchain name with "coin" suffix (case-insensitive)
   * 
   * @param id The ID or name to check against
   */
  public matchesId(id: string): boolean {
    if (!id || !id.trim()) {
      return false;
    }
    
    const normalizedId = id.toUpperCase();
    const normalizedName = this.name.toUpperCase();
    
    // Check if it matches the blockchain ID (case-insensitive)
    if (normalizedId === this.id) {
      return true;
    }
    
    // Check if it matches the blockchain name (case-insensitive)
    if (normalizedId === normalizedName) {
      return true;
    }
    
    // Check if it matches the blockchain name with "coin" suffix (case-insensitive)
    // For example: "BTC" matches "BITCOIN" and "BITCOINCOIN"
    return normalizedId === normalizedName + 'COIN';
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    return `Blockchain(id=${this.id}, name=${this.name}, addressFormat=${this.addressFormat})`;
  }
}