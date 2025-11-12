/**
 * Blockchain Constants
 * Centralized definitions for supported blockchain networks
 * 
 * This module provides a single source of truth for blockchain-related constants
 * and validation functions, ensuring consistency across the application.
 */

import { Blockchain } from './Blockchain';
import { AddressFormat } from '../address/types/AddressFormat';

// Solana blockchain instance
// Only Solana blockchain is supported in Phase 1
export const SOLANA = new Blockchain('SOLANA', 'Solana', AddressFormat.SOLANA);

// Supported blockchain constants
// This object maintains backward compatibility while providing blockchain instances
export const BLOCKCHAINS = {
  SOLANA: SOLANA
} as const;

// Type guard for blockchain validation
// Checks if a string value is a valid blockchain identifier
export function isValidBlockchain(value: string): boolean {
  return Object.values(BLOCKCHAINS).some(blockchain => blockchain.matchesId(value));
}

// Get blockchain instance by ID
// Returns the corresponding blockchain instance for the given ID
export function getBlockchainById(id: string): Blockchain | undefined {
  return Object.values(BLOCKCHAINS).find(blockchain => blockchain.matchesId(id));
}

// Get all supported blockchains
export function getAllBlockchains(): Blockchain[] {
  return Object.values(BLOCKCHAINS);
}

// Export blockchain names as a union type for type safety
// Provides TypeScript type checking for blockchain names
export type BlockchainName = 'SOLANA';
