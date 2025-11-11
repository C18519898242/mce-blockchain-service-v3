import { Redis } from 'ioredis';
import { IAddressRepository } from '../../../domain/address/interfaces/IAddressRepository';

/**
 * Redis implementation of address repository
 * Uses Redis Sets for O(1) address lookup performance
 */
export class AddressRepository implements IAddressRepository {
  constructor(private readonly redis: Redis) {}

  /**
   * Check if an address is being monitored for transactions
   * Uses Redis SISMEMBER for O(1) time complexity lookup
   * @param blockchain The blockchain type (solana, evm, bitcoin, etc.)
   * @param address The address to check
   * @returns Promise resolving to true if address is monitored, false otherwise
   */
  async isAddressMonitored(blockchain: string, address: string): Promise<boolean> {
    const key = `addresses:${blockchain.toLowerCase()}`;
    try {
      const result = await this.redis.sismember(key, address);
      return result === 1;
    } catch (error) {
      throw new Error(`Failed to check address ${address} for blockchain ${blockchain}: ${error}`);
    }
  }
}
