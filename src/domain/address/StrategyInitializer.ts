/**
 * Strategy Initializer
 * Registers all address strategies with the registry
 * Provides centralized strategy management
 * Phase 1: Only Solana is supported, but architecture maintains extensibility
 */

import { addressStrategyRegistry } from './AddressStrategyRegistry';
import { createSolanaStrategy } from './strategies/SolanaAddressStrategy';
import { BLOCKCHAINS } from '../coin/Coin';

export class StrategyInitializer {
  /**
   * Initialize and register default address strategies
   * Phase 1: Only register Solana strategy
   */
  public static initialize(): void {
    // Register Solana strategy (Phase 1 - Primary supported blockchain)
    this.registerSolanaStrategy();
    
    console.info(`Address strategy initialization complete. Supported blockchains: ${addressStrategyRegistry.getSupportedBlockchains().join(', ')}`);
  }

  /**
   * Register Solana strategy
   */
  private static registerSolanaStrategy(): void {
    const solanaStrategy = createSolanaStrategy();
    addressStrategyRegistry.registerWithValidation(solanaStrategy);
  }


  /**
   * Register custom strategy (for third-party extensions)
   */
  public static registerCustomStrategy(strategy: any): void {
    try {
      addressStrategyRegistry.registerWithValidation(strategy);
      console.info(`Custom address strategy registered for blockchain: ${strategy.blockchain}`);
    } catch (error) {
      console.error(`Failed to register custom strategy:`, error);
      throw error;
    }
  }

  /**
   * Get initialization status
   */
  public static getStatus(): {
    isInitialized: boolean;
    supportedBlockchains: string[];
    strategyCount: number;
  } {
    const supportedBlockchains = addressStrategyRegistry.getSupportedBlockchains();
    const expectedChains = Object.values(BLOCKCHAINS);
    
    return {
      isInitialized: supportedBlockchains.length >= expectedChains.length,
      supportedBlockchains,
      strategyCount: supportedBlockchains.length
    };
  }

  /**
   * Reinitialize all strategies (clears existing and re-registers)
   */
  public static reinitialize(): void {
    addressStrategyRegistry.clear();
    this.initialize();
  }

  /**
   * Validate all registered strategies
   */
  public static validateAllStrategies(): { valid: string[]; invalid: string[] } {
    const allStrategies = addressStrategyRegistry.getAllStrategies();
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const [blockchain, strategy] of allStrategies) {
      if (addressStrategyRegistry.validateStrategy(strategy)) {
        valid.push(blockchain);
      } else {
        invalid.push(blockchain);
      }
    }

    return { valid, invalid };
  }
}

// Auto-initialize strategies when module is imported
StrategyInitializer.initialize();
