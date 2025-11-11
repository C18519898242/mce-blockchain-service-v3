import { IBlockchainAdapter } from '../domain/blockchain/IBlockchainAdapter';
import { ICoinRepository } from '../domain/coin/interfaces/ICoinRepository';
import { Coin } from '../domain/coin/Coin';
import { AddressBalance } from '../domain/balance/AddressBalance';

/**
 * Balance Application Service
 * 
 * Service layer for handling balance-related business logic.
 * Provides balance query functionality by integrating blockchain adapter
 * with coin repository for coin configuration management.
 */
export class BalanceApplicationService {
  /**
   * Constructor
   * 
   * @param blockchainAdapter The blockchain adapter for querying blockchain data
   * @param coinRepository The repository for coin configuration data
   */
  constructor(
    private blockchainAdapter: IBlockchainAdapter,
    private coinRepository: ICoinRepository
  ) {}

  /**
   * Get balance for a specific address and coin
   * 
   * Retrieves coin configuration and queries blockchain for current balance.
   * Returns null if coin configuration is not found.
   * 
   * @param address The blockchain address to query balance for
   * @param coinKey The unique identifier of coin (e.g., SOLANA_USDT)
   * @returns Promise resolving to AddressBalance or null if coin not found
   */
  async getBalance(address: string, coinKey: string): Promise<AddressBalance | null> {
    // Get coin configuration from repository
    const coin = await this.coinRepository.findByKey(coinKey);
    if (!coin) {
      return null;
    }

    // Query blockchain for current balance
    const balance = await this.blockchainAdapter.getBalance(address, coin);
    const blockNumber = await this.blockchainAdapter.getLatestBlockNumber();

    // Return balance information using factory method
    return AddressBalance.withTimestamp(
      address,
      coinKey,
      balance,
      new Date().toISOString(),
      blockNumber
    );
  }
}
