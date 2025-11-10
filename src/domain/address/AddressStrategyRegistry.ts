/**
 * Address Strategy Registry
 * Manages registration and retrieval of address strategies
 * Enables plugin-based extension without modifying existing code
 */

import { IAddressStrategy } from './interfaces/IAddressStrategy';

export class AddressStrategyRegistry {
  private strategies = new Map<string, IAddressStrategy>();
  
  /**
   * Register a new address strategy
   */
  public register(strategy: IAddressStrategy): void {
    if (this.strategies.has(strategy.blockchain)) {
      console.warn(`Strategy for blockchain ${strategy.blockchain} is already registered. Overwriting...`);
    }
    
    this.strategies.set(strategy.blockchain, strategy);
    console.info(`Registered address strategy for blockchain: ${strategy.blockchain}`);
  }
  
  /**
   * Get strategy for specific blockchain
   */
  public getStrategy(blockchain: string): IAddressStrategy {
    const strategy = this.strategies.get(blockchain);
    
    if (!strategy) {
      throw new Error(`No address strategy found for blockchain: ${blockchain}. Available: ${this.getSupportedBlockchains().join(', ')}`);
    }
    
    return strategy;
  }
  
  /**
   * Check if blockchain is supported
   */
  public isSupported(blockchain: string): boolean {
    return this.strategies.has(blockchain);
  }
  
  /**
   * Get all supported blockchains
   */
  public getSupportedBlockchains(): string[] {
    return Array.from(this.strategies.keys());
  }
  
  /**
   * Unregister a strategy (for testing or dynamic removal)
   */
  public unregister(blockchain: string): boolean {
    return this.strategies.delete(blockchain);
  }
  
  /**
   * Clear all strategies (for testing)
   */
  public clear(): void {
    this.strategies.clear();
  }
  
  /**
   * Get all registered strategies (for debugging)
   */
  public getAllStrategies(): Map<string, IAddressStrategy> {
    return new Map(this.strategies);
  }
  
  /**
   * Validate strategy implementation
   */
  public validateStrategy(strategy: IAddressStrategy): boolean {
    try {
      // Check required properties
      if (!strategy.blockchain || typeof strategy.blockchain !== 'string') {
        return false;
      }
      
      // Check required methods
      const requiredMethods = ['generateAddress', 'validateAddress', 'formatAddress', 'getFormat', 'getLength', 'getPrefix', 'validatePublicKey'];
      
      for (const method of requiredMethods) {
        if (typeof (strategy as any)[method] !== 'function') {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Register strategy with validation
   */
  public registerWithValidation(strategy: IAddressStrategy): void {
    if (!this.validateStrategy(strategy)) {
      throw new Error(`Invalid strategy implementation for blockchain: ${strategy.blockchain}`);
    }
    
    this.register(strategy);
  }
}

// Global registry instance (singleton pattern)
export const addressStrategyRegistry = new AddressStrategyRegistry();
