/**
 * Address Domain Service
 * Refactored to use Strategy Pattern for Open-Closed Principle compliance
 * Coordinates address operations through registered strategies
 */

import { addressStrategyRegistry } from './AddressStrategyRegistry';
import { StrategyInitializer } from './StrategyInitializer';
import { IAddressStrategy } from './interfaces/IAddressStrategy';
import { AddressFormat } from './types/AddressFormat';

export interface AddressInfo {
  readonly blockchain: string;
  readonly address: string;
  readonly publicKey: string;
  readonly format: AddressFormat;
}

export class AddressDomainService {
  constructor(private registry = addressStrategyRegistry) {
    // Ensure strategies are initialized
    const status = StrategyInitializer.getStatus();
    if (!status.isInitialized) {
      StrategyInitializer.initialize();
    }
  }

  /**
   * Generate addresses from public key for multiple blockchains
   */
  public generateAddressesFromPublicKey(
    publicKey: string,
    chains: string[]
  ): Map<string, string> {
    const addresses = new Map<string, string>();
    
    for (const chain of chains) {
      try {
        const address = this.generateAddress(publicKey, chain);
        addresses.set(chain, address);
      } catch (error) {
        console.warn(`Failed to generate address for ${chain}:`, error);
        // Continue with other chains
      }
    }
    
    return addresses;
  }

  /**
   * Generate single address for specific blockchain
   */
  public generateAddress(publicKey: string, blockchain: string): string {
    const strategy = this.registry.getStrategy(blockchain);
    return strategy.generateAddress(publicKey);
  }

  /**
   * Validate address format for specific blockchain
   */
  public validateAddress(address: string, blockchain: string): boolean {
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return false;
    }

    try {
      const strategy = this.registry.getStrategy(blockchain);
      return strategy.validateAddress(address);
    } catch (error) {
      // If strategy not found or throws error, return false
      return false;
    }
  }

  /**
   * Format address for display
   */
  public formatAddress(address: string, blockchain: string): string {
    const strategy = this.registry.getStrategy(blockchain);
    return strategy.formatAddress(address);
  }

  /**
   * Get address format type for blockchain
   */
  public getAddressFormat(blockchain: string): AddressFormat {
    const strategy = this.registry.getStrategy(blockchain);
    return strategy.getFormat();
  }

  /**
   * Get supported blockchains
   */
  public getSupportedBlockchains(): string[] {
    return this.registry.getSupportedBlockchains();
  }

  /**
   * Check if blockchain is supported
   */
  public isSupported(blockchain: string): boolean {
    return this.registry.isSupported(blockchain);
  }

  /**
   * Get address length constraints for blockchain
   */
  public getAddressLength(blockchain: string): { min: number; max: number } {
    const strategy = this.registry.getStrategy(blockchain);
    return strategy.getLength();
  }

  /**
   * Get address prefix for blockchain
   */
  public getAddressPrefix(blockchain: string): string {
    const strategy = this.registry.getStrategy(blockchain);
    return strategy.getPrefix();
  }

  /**
   * Validate public key for specific blockchain
   */
  public validatePublicKey(publicKey: string, blockchain: string): boolean {
    try {
      const strategy = this.registry.getStrategy(blockchain);
      return strategy.validatePublicKey(publicKey);
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate address info with full details
   */
  public generateAddressInfo(
    publicKey: string, 
    blockchain: string
  ): AddressInfo {
    const strategy = this.registry.getStrategy(blockchain);
    const address = strategy.generateAddress(publicKey);
    const format = strategy.getFormat();

    return {
      blockchain,
      address,
      publicKey,
      format
    };
  }

  /**
   * Batch validate addresses for multiple blockchains
   */
  public validateAddresses(
    addresses: { address: string; blockchain: string }[]
  ): { valid: { address: string; blockchain: string }[]; invalid: { address: string; blockchain: string; error: string }[] } {
    const valid: { address: string; blockchain: string }[] = [];
    const invalid: { address: string; blockchain: string; error: string }[] = [];

    for (const { address, blockchain } of addresses) {
      try {
        if (this.validateAddress(address, blockchain)) {
          valid.push({ address, blockchain });
        } else {
          invalid.push({ 
            address, 
            blockchain, 
            error: 'Invalid address format' 
          });
        }
      } catch (error) {
        invalid.push({ 
          address, 
          blockchain, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return { valid, invalid };
  }

  /**
   * Get strategy information for debugging
   */
  public getStrategyInfo(blockchain: string): string {
    try {
      const strategy = this.registry.getStrategy(blockchain);
      if ('getInfo' in strategy && typeof (strategy as any).getInfo === 'function') {
        return (strategy as any).getInfo();
      }
      return `${blockchain} strategy - no additional info available`;
    } catch (error) {
      return `No strategy found for blockchain: ${blockchain}`;
    }
  }

  /**
   * Register custom strategy (for extensibility)
   */
  public registerCustomStrategy(strategy: IAddressStrategy): void {
    this.registry.registerWithValidation(strategy);
  }

  /**
   * Get registry status
   */
  public getRegistryStatus(): {
    supportedBlockchains: string[];
    strategyCount: number;
    isHealthy: boolean;
  } {
    const supportedBlockchains = this.registry.getSupportedBlockchains();
    const validation = StrategyInitializer.validateAllStrategies();
    
    return {
      supportedBlockchains,
      strategyCount: supportedBlockchains.length,
      isHealthy: validation.invalid.length === 0
    };
  }
}

// Export singleton instance for convenience
export const addressDomainService = new AddressDomainService();
