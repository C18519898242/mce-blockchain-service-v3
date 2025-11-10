/**
 * EVM Address Strategy
 * Implements address operations for EVM-compatible blockchains
 * Covers: Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism
 */

import { IAddressStrategy, AddressFormat } from '../interfaces/IAddressStrategy';

export class EvmAddressStrategy implements IAddressStrategy {
  readonly blockchain: string;
  private readonly name: string;

  constructor(blockchain: string) {
    this.blockchain = blockchain;
    this.name = blockchain;
  }

  generateAddress(publicKey: string): string {
    if (!this.validatePublicKey(publicKey)) {
      throw new Error('Invalid public key format for Ethereum');
    }

    // For demonstration - in real implementation would use proper crypto libraries
    if (publicKey.startsWith('0x')) {
      // Mock address generation based on public key hash
      const hash = this.simpleHash(publicKey.slice(2), 40);
      return '0x' + hash;
    }
    
    throw new Error('Ethereum public key must start with 0x');
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    // Ethereum address format: 0x + 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    return address.toLowerCase();
  }

  getFormat(): AddressFormat {
    return AddressFormat.ETHEREUM;
  }

  getLength(): { min: number; max: number } {
    return { min: 42, max: 42 }; // 0x + 40 hex characters
  }

  getPrefix(): string {
    return '0x';
  }

  validatePublicKey(publicKey: string): boolean {
    if (!publicKey || typeof publicKey !== 'string') {
      return false;
    }

    // Support hex format with or without 0x prefix
    return /^[a-fA-F0-9]{64}$/.test(publicKey) || /^0x[a-fA-F0-9]{64}$/.test(publicKey);
  }

  // Simple hash function for demonstration
  // In real implementation, use keccak256 hash
  private simpleHash(input: string, length: number): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const hexChars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += hexChars[Math.abs(hash + i) % hexChars.length];
    }
    
    return result;
  }

  // Get strategy info
  public getInfo(): string {
    return `${this.name} Address Strategy - Ethereum-compatible addresses`;
  }
}

// Factory function for EVM-compatible chains
export function createEvmStrategy(blockchain: string): EvmAddressStrategy {
  return new EvmAddressStrategy(blockchain);
}
