/**
 * Solana Address Strategy
 * Implements address operations for Solana blockchain
 */

import { IAddressStrategy, AddressFormat } from '../interfaces/IAddressStrategy';

export class SolanaAddressStrategy implements IAddressStrategy {
  readonly blockchain = 'SOLANA';
  private readonly name = 'Solana';

  generateAddress(publicKey: string): string {
    if (!this.validatePublicKey(publicKey)) {
      throw new Error('Invalid public key format for Solana');
    }

    // For demonstration - in real implementation would use Solana SDK
    if (publicKey.length >= 32) {
      const hash = this.simpleHash(publicKey, 44);
      return hash;
    }
    
    throw new Error('Invalid Solana public key length');
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Solana addresses are Base58 encoded, typically 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid Solana address format');
    }
    
    return address; // Solana addresses are case-sensitive, preserve as-is
  }

  getFormat(): AddressFormat {
    return AddressFormat.SOLANA;
  }

  getLength(): { min: number; max: number } {
    return { min: 32, max: 44 };
  }

  getPrefix(): string {
    return ''; // Solana addresses have no standard prefix
  }

  validatePublicKey(publicKey: string): boolean {
    if (!publicKey || typeof publicKey !== 'string') {
      return false;
    }

    // Solana public keys can be in Base58 format (32-44 chars)
    // or hex format (64 chars, may start with 0x)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(publicKey)) {
      return true;
    }

    if (/^[a-fA-F0-9]{64}$/.test(publicKey) || /^0x[a-fA-F0-9]{64}$/.test(publicKey)) {
      return true;
    }

    return false;
  }

  // Simple hash function for demonstration
  // In real implementation, use proper Solana key derivation
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

  // Get strategy info
  public getInfo(): string {
    return `${this.name} Address Strategy - Base58 encoded addresses`;
  }
}

// Factory function
export function createSolanaStrategy(): SolanaAddressStrategy {
  return new SolanaAddressStrategy();
}
