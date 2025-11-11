import { Coin } from '../Coin';

/**
 * Coin Repository Interface
 * Responsibility: Read coin configuration information from Redis
 * Note: This interface only contains read-only methods, coin writing is handled by Wallet Service
 */
export interface ICoinRepository {
  /**
   * Find coin by unique identifier
   * @param coinKey Coin unique identifier, format: blockchain_symbol (e.g., SOLANA_USDT)
   * @returns Promise<Coin | null> Found coin object, returns null if not exists
   */
  findByKey(coinKey: string): Promise<Coin | null>;

  /**
   * Get all coins list
   * @returns Promise<Coin[]> Array of all coin objects
   */
  findAll(): Promise<Coin[]>;
}
