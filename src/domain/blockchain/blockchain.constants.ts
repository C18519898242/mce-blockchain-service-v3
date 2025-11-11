/**
 * Blockchain Constants
 * Centralized definitions for supported blockchain networks
 * 
 * This module provides a single source of truth for blockchain-related constants
 * and validation functions, ensuring consistency across the application.
 */

// Supported blockchain constants
// Only Solana blockchain is supported in Phase 1
export const BLOCKCHAINS = {
  SOLANA: 'SOLANA'
} as const;

// Type guard for blockchain validation
// Checks if a string value is a valid blockchain identifier
export function isValidBlockchain(value: string): value is keyof typeof BLOCKCHAINS {
  return Object.values(BLOCKCHAINS).includes(value as typeof BLOCKCHAINS[keyof typeof BLOCKCHAINS]);
}

// Export blockchain names as a union type for type safety
// Provides TypeScript type checking for blockchain names
export type BlockchainName = typeof BLOCKCHAINS[keyof typeof BLOCKCHAINS];
