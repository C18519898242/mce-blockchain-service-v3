/**
 * Address Module Exports
 * Centralized exports for address-related functionality
 */

// Domain Service
export { AddressDomainService, addressDomainService } from './AddressService';
export type { AddressInfo } from './AddressService';

// Strategy Interface
export { IAddressStrategy, AddressFormat } from './interfaces/IAddressStrategy';

// Registry
export { AddressStrategyRegistry, addressStrategyRegistry } from './AddressStrategyRegistry';

// Strategy Initializer
export { StrategyInitializer } from './StrategyInitializer';

// Strategy Implementations
export { EvmAddressStrategy, createEvmStrategy } from './strategies/EvmAddressStrategy';
export { SolanaAddressStrategy, createSolanaStrategy } from './strategies/SolanaAddressStrategy';
export { BitcoinAddressStrategy, createBitcoinStrategy } from './strategies/BitcoinAddressStrategy';
export { TronAddressStrategy, createTronStrategy } from './strategies/TronAddressStrategy';

// Re-export for convenience
import { AddressDomainService, addressDomainService } from './AddressService';
import { StrategyInitializer } from './StrategyInitializer';

/**
 * Get address service instance (auto-initialized)
 */
export function getAddressService(): AddressDomainService {
  return addressDomainService;
}

/**
 * Initialize address strategies (called automatically on import)
 */
export function initializeAddressStrategies(): void {
  StrategyInitializer.initialize();
}

/**
 * Get supported blockchains
 */
export function getSupportedBlockchains(): string[] {
  return addressDomainService.getSupportedBlockchains();
}

/**
 * Validate address (convenience function)
 */
export function validateAddress(address: string, blockchain: string): boolean {
  return addressDomainService.validateAddress(address, blockchain);
}

/**
 * Generate address (convenience function)
 */
export function generateAddress(publicKey: string, blockchain: string): string {
  return addressDomainService.generateAddress(publicKey, blockchain);
}

/**
 * Generate multiple addresses (convenience function)
 */
export function generateAddresses(publicKey: string, blockchains: string[]): Map<string, string> {
  return addressDomainService.generateAddressesFromPublicKey(publicKey, blockchains);
}

// Auto-initialize strategies when module is imported
initializeAddressStrategies();
