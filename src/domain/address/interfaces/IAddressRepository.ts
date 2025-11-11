/**
 * Repository interface for address monitoring operations
 * Follows minimal design principle - only implements what is actually needed
 */
export interface IAddressRepository {
  /**
   * Check if an address is being monitored for transactions
   * @param blockchain The blockchain type (solana, evm, bitcoin, etc.)
   * @param address The address to check
   * @returns Promise resolving to true if address is monitored, false otherwise
   */
  isAddressMonitored(blockchain: string, address: string): Promise<boolean>;
}
