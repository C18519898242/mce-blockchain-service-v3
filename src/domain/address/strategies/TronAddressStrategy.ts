/**
 * TRON Address Strategy
 * Implements address operations for TRON blockchain
 */

import { IAddressStrategy, AddressFormat } from '../interfaces/IAddressStrategy';

export class TronAddressStrategy implements IAddressStrategy {
  readonly blockchain = 'TRON';
  private readonly name = 'TRON';

  generateAddress(publicKey: string): string {
    if (!this.validatePublicKey(publicKey)) {
      throw new Error('Invalid public key format for TRON');
    }

    // For demonstration - in real implementation would use TRON libraries
    if (publicKey.length >= 32) {
      const hash = this.simpleHash(publicKey, 34);
      // Ensure it starts with T
      return 'T' + hash.slice(1);
    }
    
    throw new Error('Invalid TRON public key length');
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // TRON addresses are Base58 encoded, always start with T, 34 characters total
    return /^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(address);
  }

  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid TRON address format');
    }
    
    return address; // TRON addresses preserve case
  }

  getFormat(): AddressFormat {
    return AddressFormat.TRON;
  }

  getLength(): { min: number; max: number } {
    return { min: 34, max: 34 };
  }

  getPrefix(): string {
    return 'T';
  }

  validatePublicKey(publicKey: string): boolean {
    if (!publicKey || typeof publicKey !== 'string') {
      return false;
    }

    // TRON public keys can be:
    // 1. Hex format (64 chars, may start with 0x)
    // 2. Base58 format (33 chars)

    // Hex format
    if (/^[a-fA-F0-9]{64}$/.test(publicKey) || /^0x[a-fA-F0-9]{64}$/.test(publicKey)) {
      return true;
    }

    // Base58 format
    if (/^[1-9A-HJ-NP-Za-km-z]{33}$/.test(publicKey)) {
      return true;
    }

    return false;
  }

  // Simple hash function for demonstration
  // In real implementation, use proper TRON key derivation (Keccak256 + Base58Check)
  private simpleHash(input: string, length: number): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += base58Chars[Math.abs(hash + i) % base58Chars.length];
    }
    
    return result;
  }

  // Get address type
  public getAddressType(address: string): 'standard' | 'unknown' {
    if (this.validateAddress(address)) {
      return 'standard';
    }
    
    return 'unknown';
  }

  // Get strategy info
  public getInfo(): string {
    return `${this.name} Address Strategy - Base58 encoded addresses starting with T`;
  }
}

// Factory function
export function createTronStrategy(): TronAddressStrategy {
  return new TronAddressStrategy();
}
