/**
 * Bitcoin Address Strategy
 * Implements address operations for Bitcoin blockchain
 */

import { IAddressStrategy, AddressFormat } from '../interfaces/IAddressStrategy';

export class BitcoinAddressStrategy implements IAddressStrategy {
  readonly blockchain = 'BITCOIN';
  private readonly name = 'Bitcoin';

  generateAddress(publicKey: string): string {
    if (!this.validatePublicKey(publicKey)) {
      throw new Error('Invalid public key format for Bitcoin');
    }

    // For demonstration - in real implementation would use Bitcoin libraries
    if (publicKey.length >= 33) {
      const hash = this.simpleHash(publicKey, 34);
      // Ensure it starts with common Bitcoin prefixes (1, 3)
      const prefix = hash[0] === '1' ? '1' : '3';
      return prefix + hash.slice(1);
    }
    
    throw new Error('Invalid Bitcoin public key length');
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Support legacy Bitcoin addresses (1, 3) and segwit addresses (bc1)
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
      return true;
    }

    if (/^bc1[a-z0-9]{8,87}$/.test(address)) {
      return true;
    }

    return false;
  }

  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid Bitcoin address format');
    }
    
    return address; // Bitcoin addresses preserve case
  }

  getFormat(): AddressFormat {
    return AddressFormat.BITCOIN;
  }

  getLength(): { min: number; max: number } {
    return { min: 26, max: 35 }; // Legacy addresses
  }

  getPrefix(): string {
    return '1/3/bc1'; // Support multiple prefix types
  }

  validatePublicKey(publicKey: string): boolean {
    if (!publicKey || typeof publicKey !== 'string') {
      return false;
    }

    // Bitcoin public keys can be:
    // 1. Hex format (66 chars for compressed, 130 chars for uncompressed)
    // 2. Base58 format
    // 3. May start with 0x for hex format

    // Compressed public key (66 chars, may start with 0x)
    if (/^[0-9a-fA-F]{66}$/.test(publicKey) || /^0x[0-9a-fA-F]{66}$/.test(publicKey)) {
      return true;
    }

    // Uncompressed public key (130 chars, may start with 0x)
    if (/^[0-9a-fA-F]{130}$/.test(publicKey) || /^0x[0-9a-fA-F]{130}$/.test(publicKey)) {
      return true;
    }

    // Base58 format
    if (/^[1-9A-HJ-NP-Za-km-z]{33,90}$/.test(publicKey)) {
      return true;
    }

    return false;
  }

  // Simple hash function for demonstration
  // In real implementation, use proper Bitcoin key derivation (SHA256 + RIPEMD160)
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
  public getAddressType(address: string): 'legacy' | 'segwit' | 'unknown' {
    if (/^[13]/.test(address)) {
      return 'legacy';
    }
    
    if (/^bc1/.test(address)) {
      return 'segwit';
    }
    
    return 'unknown';
  }

  // Get strategy info
  public getInfo(): string {
    return `${this.name} Address Strategy - Supports legacy and segwit addresses`;
  }
}

// Factory function
export function createBitcoinStrategy(): BitcoinAddressStrategy {
  return new BitcoinAddressStrategy();
}
