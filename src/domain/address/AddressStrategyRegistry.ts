/**
 * Address Strategy Registry
 * Manages registration and retrieval of address strategies
 * Enables plugin-based extension without modifying existing code
 */

import { IAddressStrategy } from './interfaces/IAddressStrategy';
import { Blockchain } from '../blockchain/Blockchain';

export class AddressStrategyRegistry {
  private strategies = new Map<string, IAddressStrategy>();
  
  /**
   * Register a new address strategy
   */
  public register(strategy: IAddressStrategy): void {
    const blockchainId = strategy.blockchain.getId();
    if (this.strategies.has(blockchainId)) {
      console.warn(`Strategy for blockchain ${blockchainId} is already registered. Overwriting...`);
    }
    
    this.strategies.set(blockchainId, strategy);
    console.info(`Registered address strategy for blockchain: ${blockchainId}`);
  }
  
  /**
   * Get strategy for specific blockchain by ID
   */
  public getStrategy(blockchain: string | Blockchain): IAddressStrategy {
    if (!blockchain) {
      throw new Error('Blockchain cannot be null or undefined');
    }
    const blockchainId = typeof blockchain === 'string' ? blockchain : blockchain.getId();
    const strategy = this.strategies.get(blockchainId);
    
    if (!strategy) {
      throw new Error(`No address strategy found for blockchain: ${blockchainId}. Available: ${this.getSupportedBlockchains().join(', ')}`);
    }
    
    return strategy;
  }
  
  /**
    * 检查指定的区块链是否支持
    */
   public isSupported(blockchain: string | Blockchain): boolean {
     if (!blockchain) {
       return false;
     }
     const blockchainId = typeof blockchain === 'string' ? blockchain : blockchain.getId();
     return this.strategies.has(blockchainId);
   }
  
  /**
   * Get all supported blockchain IDs
   */
  public getSupportedBlockchains(): string[] {
    return Array.from(this.strategies.keys());
  }
  
  /**
   * Unregister a strategy by blockchain ID
   */
  public unregister(blockchain: string | Blockchain): boolean {
    const blockchainId = typeof blockchain === 'string' ? blockchain : blockchain.getId();
    return this.strategies.delete(blockchainId);
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
      if (!strategy.blockchain || !(strategy.blockchain instanceof Blockchain)) {
        return false;
      }
      
      // Check required methods
      const requiredMethods = ['generateAddress', 'validateAddress', 'formatAddress', 'getLength', 'getPrefix', 'validatePublicKey'];
      
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
      throw new Error(`Invalid strategy implementation for blockchain: ${strategy.blockchain.getId()}`);
    }
    
    this.register(strategy);
  }
}

// Global registry instance (singleton pattern)
export const addressStrategyRegistry = new AddressStrategyRegistry();
