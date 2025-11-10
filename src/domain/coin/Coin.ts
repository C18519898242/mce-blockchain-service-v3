/**
 * Coin Entity
 * Represents a cryptocurrency coin with blockchain-specific properties
 * Based on design specification: blockchain + symbol combination as unique identifier
 */

export interface CoinProperties {
  readonly key: string;             // 唯一标识：ETH_USDT, SOL_USDT
  readonly blockchain: string;       // ETH, SOLANA, TRON, BTC
  readonly symbol: string;           // USDT, USDC, ETH
  readonly decimals: number;          // 精度：6, 8, 18
  readonly contractAddress?: string;  // 代币合约地址
}

export class Coin {
  public readonly key: string;
  public readonly blockchain: string;
  public readonly symbol: string;
  public readonly decimals: number;
  public readonly contractAddress?: string;

  constructor(properties: CoinProperties) {
    this.key = properties.key;
    this.blockchain = properties.blockchain;
    this.symbol = properties.symbol;
    this.decimals = properties.decimals;
    this.contractAddress = properties.contractAddress;
    
    this.validate();
  }

  // Business methods
  public isNative(): boolean {
    return !this.contractAddress;
  }

  public isToken(): boolean {
    return !!this.contractAddress;
  }

  public getFullName(): string {
    return `${this.blockchain}_${this.symbol}`;
  }

  // Factory methods
  public static createNativeCoin(blockchain: string, symbol: string, decimals: number): Coin {
    const key = `${blockchain}_${symbol}`;
    return new Coin({
      key,
      blockchain,
      symbol,
      decimals
    });
  }

  public static createToken(
    blockchain: string, 
    symbol: string, 
    decimals: number, 
    contractAddress: string
  ): Coin {
    const key = `${blockchain}_${symbol}`;
    return new Coin({
      key,
      blockchain,
      symbol,
      decimals,
      contractAddress
    });
  }

  // Serialization
  public toJSON(): CoinJSON {
    return {
      key: this.key,
      blockchain: this.blockchain,
      symbol: this.symbol,
      decimals: this.decimals,
      contractAddress: this.contractAddress
    };
  }

  public static fromJSON(json: CoinJSON): Coin {
    return new Coin({
      key: json.key,
      blockchain: json.blockchain,
      symbol: json.symbol,
      decimals: json.decimals,
      contractAddress: json.contractAddress
    });
  }

  // Private validation
  private validate(): void {
    if (!this.key || this.key.trim().length === 0) {
      throw new Error('Coin key is required');
    }

    if (!this.blockchain || this.blockchain.trim().length === 0) {
      throw new Error('Blockchain is required');
    }

    if (!this.symbol || this.symbol.trim().length === 0) {
      throw new Error('Symbol is required');
    }

    if (this.decimals < 0 || this.decimals > 18) {
      throw new Error('Decimals must be between 0 and 18');
    }

    // Validate key format: blockchain_symbol
    const expectedKey = `${this.blockchain}_${this.symbol}`;
    if (this.key !== expectedKey) {
      throw new Error(`Coin key must be in format 'blockchain_symbol'. Expected: ${expectedKey}, Got: ${this.key}`);
    }
  }
}

// JSON serialization interface
export interface CoinJSON {
  key: string;
  blockchain: string;
  symbol: string;
  decimals: number;
  contractAddress?: string;
}

// Supported blockchain constants (each requires specific adapter)
// Phase 1: Only Solana is supported
export const BLOCKCHAINS = {
  SOLANA: 'SOLANA'
} as const;

// Type guard for blockchain validation
export function isValidBlockchain(value: string): value is keyof typeof BLOCKCHAINS {
  return Object.values(BLOCKCHAINS).includes(value as typeof BLOCKCHAINS[keyof typeof BLOCKCHAINS]);
}
