import { ICoinRepository } from '../../../domain/coin/interfaces/ICoinRepository';
import { Coin, CoinJSON } from '../../../domain/coin/Coin';
import { RedisService } from '../../redis/redis.service';
import { Logger } from 'winston';

/**
 * Coin Repository Redis Implementation
 * Responsibility: Read coin configuration information from Redis Hash
 * Data Structure: coins Hash, field is coinKey, value is JSON string
 */
export class CoinRepository implements ICoinRepository {
  private readonly COINS_HASH_KEY = 'coins';

  constructor(
    private readonly redisService: RedisService,
    private readonly logger: Logger
  ) {}

  /**
   * Find coin by unique identifier
   * @param coinKey Coin unique identifier, format: blockchain_symbol (e.g., SOLANA_USDT)
   * @returns Promise<Coin | null> Found coin object, returns null if not exists
   */
  async findByKey(coinKey: string): Promise<Coin | null> {
    try {
      const coinJson = await this.redisService.hget(this.COINS_HASH_KEY, coinKey);
      
      if (!coinJson) {
        return null;
      }

      const coinData: CoinJSON = JSON.parse(coinJson);
      return Coin.fromJSON(coinData);
    } catch (error) {
      // Log error
      this.logger.error(`Error finding coin by key ${coinKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all coins list
   * @returns Promise<Coin[]> Array of all coin objects
   */
  async findAll(): Promise<Coin[]> {
    try {
      const coinsHash = await this.redisService.hgetall(this.COINS_HASH_KEY);
      
      if (!coinsHash || Object.keys(coinsHash).length === 0) {
        return [];
      }

      const coins: Coin[] = [];
      
      for (const [coinKey, coinJson] of Object.entries(coinsHash)) {
        try {
          const coinData: CoinJSON = JSON.parse(coinJson);
          coins.push(Coin.fromJSON(coinData));
        } catch (parseError) {
          // Skip unparseable coin data, log warning
          this.logger.warn(`Failed to parse coin data for key ${coinKey}:`, parseError);
        }
      }

      return coins;
    } catch (error) {
      this.logger.error('Error finding all coins:', error);
      throw error;
    }
  }
}
